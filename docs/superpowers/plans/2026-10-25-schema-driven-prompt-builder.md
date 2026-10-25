# Schema-Driven Prompt Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy onboarding prompt builder with a guided form that covers and validates the complete current team schema.

**Architecture:** Add pure schema/configuration helpers and a recursive React form driven by the imported JSON Schema. Wire the form to a validated JSON prompt preview, preserving the existing copy workflow and required/optional filter.

**Tech Stack:** React 19, Docusaurus 3, JSON Schema Draft 2020-12, Ajv, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-10-25-schema-driven-prompt-builder-design.md`

## Global Constraints

- Let users configure every field in `team.schema.json`, including nested maps, objects, and arrays.
- Generate a prompt containing a team configuration that validates against the imported schema.
- Use schema descriptions and constraints as the source for field guidance and validation, so future schema changes do not silently leave the builder behind.
- Preserve the existing onboarding page and required/optional field filtering.
- Do not change the canonical schema or its synchronized docs copy.
- Do not add capabilities that are not represented in the schema.
- Do not maintain a second hand-written field catalog or generate guessed values for fields the user has not configured.
- Do not change Nomos behavior or the schema viewer's documentation role.
- The component must use the imported `team.schema.json`; field hints must display schema descriptions exactly.
- The current schema includes references, nested objects, maps, arrays, enums, patterns, and conditional team-key prefixes. The builder must preserve these constraints when rendering and validating input.
- Optional booleans must distinguish unset from explicit `false` and `true`.
- Optional values can be unset after configuration without leaving a property with an invalid `undefined` value.
- Show a partial preview while users fill the form, but block copying until the configuration validates.

## Review Focus

- Dynamically named maps with nested entries — test adding/removing an Authentik group and a repository entry while retaining the nested values (Task 2).
- Nested schema-required fields — test that the required root and nested fields appear in the initial configuration and that incomplete configurations fail validation (Task 1).
- Optional booleans — test that an unset property is omitted while explicitly setting it to `false` remains in the JSON (Task 1).
- Conditional team key prefixes — test that `team_type: "platform-team"` accepts a `pt-` key and rejects an `st-` key (Task 1).
- Custom CIDR format — test valid IPv4 CIDRs and reject invalid octets or prefix lengths (Task 1).

---

## File Structure

- `src/components/PromptBuilder/schemaSupport.mjs` — schema initialization, validation, and prompt serialization.
- `src/components/PromptBuilder/schemaSupport.test.mjs` — focused Node tests for schema behavior and serialization.
- `src/components/PromptBuilder/SchemaForm.jsx` — recursive controls for schema properties and dynamic map/array entries.
- `src/components/PromptBuilder/index.jsx` — form state, filter counts, validation feedback, preview, and copy behavior.
- `src/components/PromptBuilder/styles.module.css` — styles for nested schema controls and map/array actions.
- `docs/getting-started/onboarding.mdx` — user guidance for full-schema configuration.
- `package.json` and `yarn.lock` — Ajv dependencies and the focused test command.

### Task 1: Schema Configuration and Validation Helpers

**Files:**
- Create: `src/components/PromptBuilder/schemaSupport.mjs`
- Create: `src/components/PromptBuilder/schemaSupport.test.mjs`
- Modify: `package.json`
- Modify: `yarn.lock`

**Interfaces:**
- `createInitialConfig(schema)` returns an object containing required schema properties and recursively initialized required objects; required strings begin empty, required arrays/maps begin empty, and optional values remain absent.
- `validateConfig(config, schema)` returns `{ valid, errors }`, where each error contains a JSON Pointer `path` and validator `message`.
- `buildPrompt(config)` returns a concise instruction followed by a fenced JSON block containing `JSON.stringify(config, null, 2)`.
- `getTopLevelFieldCounts(schema)` returns `{ required, optional }` counts derived from `schema.properties` and `schema.required`.

- [x] **Step 1: Write failing schema helper tests**

Add tests for:
- A minimal valid team configuration matching all required schema fields.
- Required nested initialization and rejection of a missing/invalid required value.
- `platform-team` with a `pt-` key accepted and the same type with an `st-` key rejected.
- Valid CIDR `10.0.0.0/24` accepted; invalid octet `300.0.0.0/24` and prefix `/33` rejected.
- Unset optional booleans omitted while explicit `false` remains present and validates.
- Unknown properties rejected by `additionalProperties: false`.
- `buildPrompt` includes the JSON configuration and does not emit legacy field names.
- `getTopLevelFieldCounts` accounts for every schema property, including `team_key`.

- [x] **Step 2: Run tests and verify the expected failure**

Run: `node --test src/components/PromptBuilder/schemaSupport.test.mjs`
Expected: FAIL because the schema support module and exports do not yet exist.

- [x] **Step 3: Implement schema initialization, validation, and prompt serialization**

Use Ajv's Draft 2020-12 implementation with `ajv-formats` for standard formats and register the schema's `ipv4-cidr` format. Enable all-errors reporting and preserve JSON Pointer paths. Add the `test` script to `package.json`; add dependencies and update the lockfile using Yarn.

- [x] **Step 4: Run focused tests**

Run: `yarn test`
Expected: PASS for all schema helper tests, including conditional prefixes, custom CIDR validation, and optional boolean omission semantics.

### Task 2: Recursive Schema Form

**Files:**
- Create: `src/components/PromptBuilder/SchemaForm.jsx`
- Modify: `src/components/PromptBuilder/styles.module.css`
- Modify: `src/components/PromptBuilder/schemaSupport.mjs`
- Modify: `src/components/PromptBuilder/schemaSupport.test.mjs`

**Interfaces:**
- `SchemaForm({ schema, value, onChange, showOptional, errors })` renders the schema-backed form and calls `onChange(nextConfig)` for edits.
- The form consumes `createInitialConfig` and `validateConfig` from Task 1; schema paths use JSON Pointer strings to associate errors with controls.
- Value updates use `setValueAtPath` and `removeValueAtPath`; dynamic entries use the map helpers; array controls use `isEmptyDraft`.
- `resolveSchemaNode(schema, node)` resolves `$ref` nodes against `$defs`; `setValueAtPath(config, path, value)`, `removeValueAtPath(config, path)`, `setMapEntry(config, path, key, entry)`, and `removeMapEntry(config, path, key)` return immutable updated configurations. `path` is an array of property names.
- `isEmptyDraft(value)` returns whether an array-entry draft is unset (`undefined`) or empty (`''`).

- [x] **Step 1: Add failing schema traversal and map-entry tests**

Test that `resolveSchemaNode` resolves the `$defs.githubRepository` and `$defs.githubMembership` references, preserving their nested properties and required fields. Test immutable map-entry add, update, and remove operations for `authentik_groups` and `github_repositories` without losing sibling data; test `setValueAtPath` updates a nested field without mutating the original config; test `removeValueAtPath` unsets an optional boolean without mutating the original config; test that an unset enum-array draft cannot be added.

- [x] **Step 2: Run the focused tests**

Run: `yarn test`
Expected: FAIL because the recursive traversal and map operations are not implemented.

- [x] **Step 3: Implement recursive controls**

Render controls from each schema node: text/number inputs, enum selects, tri-state optional booleans, primitive arrays with add/remove, fixed object properties, and editable `additionalProperties` maps. Use `resolveSchemaNode` for `$ref`, `setValueAtPath` for value changes, `removeValueAtPath` to unset optional properties, the map helpers for dynamic entries, and `isEmptyDraft` to disable adding an unset array entry. Display schema descriptions verbatim, mark required fields from their containing object's `required` list, and apply the optional filter recursively. Use stable JSON Pointer paths for errors.

- [x] **Step 4: Run focused tests**

Run: `yarn test`
Expected: PASS; map-entry operations retain other entries and nested values.

### Task 3: Prompt Builder Integration and Onboarding Guidance

**Files:**
- Modify: `src/components/PromptBuilder/index.jsx`
- Modify: `src/components/PromptBuilder/styles.module.css`
- Modify: `docs/getting-started/onboarding.mdx`
- Test: `src/components/PromptBuilder/schemaSupport.test.mjs`

**Interfaces:**
- `PromptBuilder` owns the `createInitialConfig(teamSchema)` result, passes it to `SchemaForm`, and uses `validateConfig(config, teamSchema)`, `buildPrompt(config)`, and `getTopLevelFieldCounts(teamSchema)` for validation, preview, and filter counts.
- The recursive form uses the schema controls from Task 2; the copy button copies exactly the displayed prompt only when the configuration is valid.

- [x] **Step 1: Replace legacy fields with the schema form**

Implement `getTopLevelFieldCounts` from `schema.properties` and `schema.required`. Remove legacy hand-coded field state, validation, and serialization. Connect the recursive form to the imported schema, show validation feedback after a copy attempt, keep the partial JSON prompt preview visible, and disable copying until the configuration validates. Update onboarding guidance to describe full schema configuration rather than only cloud, workflow, database, and Kubernetes options.

- [x] **Step 2: Run tests and build**

Run: `yarn test && yarn build`
Expected: PASS; all helper tests pass and Docusaurus builds with the full recursive form and onboarding copy.

- [ ] **Step 3: Smoke-test the rendered onboarding form (blocked: no connected browser; browser diagnostics found Chrome/Edge unavailable)**

Start the site with `yarn start --host 127.0.0.1 --port 3000`. In a browser, verify required fields are shown initially, optional fields appear when enabled, an Authentik group can be added with nested fields, an optional boolean can be set to `false` and reset to unset, and the preview contains the JSON configuration while invalid configurations cannot be copied.

- [ ] **Step 4: Run required pre-commit checks and commit**

Run `pre-commit autoupdate --freeze` once in this repository for the session, then `pre-commit run -a`. Include any resulting `.pre-commit-config.yaml` update in the commit. Commit the design, plan, implementation, and tests together with a sentence-case message and the required Co-authored-by trailer.
