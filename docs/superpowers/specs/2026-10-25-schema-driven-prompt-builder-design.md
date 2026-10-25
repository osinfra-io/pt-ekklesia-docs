# Schema-Driven Prompt Builder Design

## Intent

Update the onboarding prompt builder to cover the complete current team schema.
The current form uses legacy fields and omits required fields and newer nested
capabilities, even though the schema copy in Ekklesia matches Techne's canonical
schema.

## Goals

- Let users configure every field in `team.schema.json`, including nested maps,
  objects, and arrays.
- Generate a prompt containing a team configuration that validates against the
  imported schema.
- Use schema descriptions and constraints as the source for field guidance and
  validation, so future schema changes do not silently leave the builder behind.
- Preserve the existing onboarding page and required/optional field filtering.

## Non-goals and anti-goals

- Do not change the canonical schema or its synchronized docs copy.
- Do not add capabilities that are not represented in the schema.
- Do not maintain a second hand-written field catalog or generate guessed values
  for fields the user has not configured.
- Do not change Nomos behavior or the schema viewer's documentation role.

## Constraints

- The component must use the imported `team.schema.json`; field hints must display
  schema descriptions exactly.
- The current schema includes references, nested objects, maps, arrays, enums,
  patterns, and conditional team-key prefixes. The builder must preserve these
  constraints when rendering and validating input.
- The current repository has no JSON Schema validation dependency or component
  test runner.

## Approaches

1. **Schema-driven nested form (chosen)** — Render controls recursively from the
   schema, including add/remove controls for map entries and arrays, then build
   and validate schema-shaped JSON for the prompt. This gives users guided
   controls while keeping fields and constraints tied to the schema. It requires
   a careful form renderer for the schema's nested structures.
2. **Schema-validated JSON editor** — Accept arbitrary valid team JSON and
   validate it against the schema. This is simpler and naturally covers every
   field, but shifts JSON authoring and schema knowledge onto onboarding users.
3. **Hand-built controls for every field** — Design a tailored UI for the full
   schema. This can be polished, but duplicates field definitions and validation
   logic, recreating the drift that caused the current mismatch.

The user chose the schema-driven nested form because it provides full schema
coverage without making onboarding users author JSON.

## Design

Replace the legacy hard-coded input model and prompt serializer with a recursive
form driven by the imported schema. Support every field and nested structure in
the current schema, including dynamically named map keys and repeated array
values. Render schema descriptions verbatim and use schema constraints for
input validation, including conditional key-prefix rules. Add a JSON Schema
validator compatible with the schema draft if needed, including support for the
schema's custom CIDR format.

The generated prompt will contain a short instruction followed by a fenced JSON
configuration matching the schema. Required properties will be represented in
the form, optional properties will remain omitted until configured, and no
values will be invented. Optional booleans must distinguish unset from explicit
`false` and `true`.

Keep the current preview/copy workflow and required/optional filter: show a
partial preview while users fill the form, but block copying until the
configuration validates. Update counts and validation to reflect the current
schema rather than legacy fields.

Implementation details such as the recursive control decomposition and
validation helper boundaries are left to the builder.
