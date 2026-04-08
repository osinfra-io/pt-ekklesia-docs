// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Platform Teams',
      link: { type: 'doc', id: 'platform-teams/index' },
      items: [
        'platform-teams/logos',
        'platform-teams/corpus',
        'platform-teams/pneuma',
        'platform-teams/arche',
        'platform-teams/techne',
        'platform-teams/ekklesia',
      ],
    },
    {
      type: 'category',
      label: 'Stream-Aligned Teams',
      link: { type: 'doc', id: 'stream-aligned-teams/index' },
      items: [
        'stream-aligned-teams/ethos',
      ],
    },
  ],
};

export default sidebars;
