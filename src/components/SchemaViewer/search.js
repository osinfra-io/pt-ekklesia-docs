export function getChildren(prop) {
  const mapProps = prop.type === 'map' ? prop.valueSchema?.properties : null;
  const namedEntries = prop.type === 'map' && prop.properties;
  const children = namedEntries
    ? {...namedEntries, '‹other key›': {...prop.valueSchema, required: false}}
    : mapProps ?? prop.properties;
  return children && Object.keys(children).length > 0 ? children : null;
}

export function matchesOwnFields(name, prop, query) {
  if (!query) return true;
  const fields = [
    name,
    prop.type,
    prop.description,
    prop.default === undefined ? '' : JSON.stringify(prop.default),
    prop.pattern,
    prop.enum?.join(' '),
    prop.itemConstraints?.description,
    prop.itemConstraints?.pattern,
  ];
  return fields.some(value => value?.toLowerCase().includes(query));
}

export function matchesSearch(name, prop, query) {
  return matchesOwnFields(name, prop, query) || Object.entries(getChildren(prop) ?? {})
    .some(([childName, child]) => matchesSearch(childName, child, query));
}

export function collectExpandablePaths(properties, query, parentPath = '') {
  return Object.entries(properties).flatMap(([name, prop]) => {
    if (!matchesSearch(name, prop, query)) return [];
    const path = parentPath ? `${parentPath}.${name}` : name;
    const children = getChildren(prop);
    if (!children) return [];
    const childQuery = matchesOwnFields(name, prop, query) ? '' : query;
    return [path, ...collectExpandablePaths(children, childQuery, path)];
  });
}
