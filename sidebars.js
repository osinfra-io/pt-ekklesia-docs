// @ts-check

// The `// region: <section>` / `// endregion: <section>` markers below are
// consumed by `pt-techne-mcp-server`'s `render_sidebar_patch` tool, which
// inserts new team entries between them. Keep them in place; deleting or
// renaming a marker will cause that tool to fail with `source_parse_error`.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Platform Teams',
      link: { type: 'doc', id: 'platform-teams/index' },
      items: [
        // region: platform-teams
        {
          type: 'category',
          label: 'Logos',
          link: { type: 'doc', id: 'platform-teams/logos/index' },
          items: [
            'platform-teams/logos/resource-hierarchy',
            'platform-teams/logos/identity-access',
            'platform-teams/logos/team-topology',
            'platform-teams/logos/saas-governance',
          ],
        },
        {
          type: 'category',
          label: 'Corpus',
          link: { type: 'doc', id: 'platform-teams/corpus/index' },
          items: [
            'platform-teams/corpus/tenancy',
            'platform-teams/corpus/networking',
            'platform-teams/corpus/data-services',
            'platform-teams/corpus/ci-cd-enablement',
          ],
        },
        {
          type: 'category',
          label: 'Pneuma',
          link: { type: 'doc', id: 'platform-teams/pneuma/index' },
          items: [
            'platform-teams/pneuma/cluster-management',
            'platform-teams/pneuma/service-mesh',
            'platform-teams/pneuma/certificate-management',
            'platform-teams/pneuma/policy-enforcement',
            'platform-teams/pneuma/observability',
          ],
        },
        {
          type: 'category',
          label: 'Arche',
          link: { type: 'doc', id: 'platform-teams/arche/index' },
          items: [
            'platform-teams/arche/core-helpers',
            'platform-teams/arche/module-development',
            'platform-teams/arche/google-cloud',
            'platform-teams/arche/kubernetes',
          ],
        },
        {
          type: 'category',
          label: 'Ekklesia',
          link: { type: 'doc', id: 'platform-teams/ekklesia/index' },
          items: [
            'platform-teams/ekklesia/documentation',
          ],
        },
        {
          type: 'category',
          label: 'Kryptos',
          link: { type: 'doc', id: 'platform-teams/kryptos/index' },
          items: [
            'platform-teams/kryptos/open-bao',
          ],
        },
        {
          type: 'category',
          label: 'Techne',
          link: { type: 'doc', id: 'platform-teams/techne/index' },
          items: [
            'platform-teams/techne/deployment-automation',
            'platform-teams/techne/developer-experience',
          ],
        },
        // endregion: platform-teams
      ],
    },
    {
      type: 'category',
      label: 'Stream-Aligned Teams',
      link: { type: 'doc', id: 'stream-aligned-teams/index' },
      items: [
        // region: stream-aligned-teams
        {
          type: 'category',
          label: 'Ethos',
          link: { type: 'doc', id: 'stream-aligned-teams/ethos/index' },
          items: [],
        },
        // endregion: stream-aligned-teams
      ],
    },
    {
      type: 'category',
      label: 'Complicated Subsystem Teams',
      link: { type: 'doc', id: 'complicated-subsystem-teams/index' },
      items: [
        // region: complicated-subsystem-teams
        {
          type: 'category',
          label: 'Mysterion',
          link: { type: 'doc', id: 'complicated-subsystem-teams/mysterion/index' },
          items: [],
        },
        // endregion: complicated-subsystem-teams
      ],
    },
    {
      type: 'category',
      label: 'Enabling Teams',
      link: { type: 'doc', id: 'enabling-teams/index' },
      items: [
        // region: enabling-teams
        {
          type: 'category',
          label: 'Sophrosyne',
          link: { type: 'doc', id: 'enabling-teams/sophrosyne/index' },
          items: [],
        },
        {
          type: 'category',
          label: 'Soteria',
          link: { type: 'doc', id: 'enabling-teams/soteria/index' },
          items: [],
        },
        // endregion: enabling-teams
      ],
    },
  ],
};

export default sidebars;
