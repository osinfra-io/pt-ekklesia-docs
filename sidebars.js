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
      label: 'Platform Grouping',
      link: { type: 'doc', id: 'platform-grouping/index' },
      items: [
        // region: platform-grouping
        {
          type: 'category',
          label: 'Logos',
          link: { type: 'doc', id: 'platform-grouping/logos/index' },
          items: [
            'platform-grouping/logos/resource-hierarchy',
            'platform-grouping/logos/identity-access',
            'platform-grouping/logos/team-topology',
            'platform-grouping/logos/saas-governance',
          ],
        },
        {
          type: 'category',
          label: 'Corpus',
          link: { type: 'doc', id: 'platform-grouping/corpus/index' },
          items: [
            'platform-grouping/corpus/tenancy',
            'platform-grouping/corpus/networking',
            'platform-grouping/corpus/data-services',
            'platform-grouping/corpus/ci-cd-enablement',
          ],
        },
        {
          type: 'category',
          label: 'Pneuma',
          link: { type: 'doc', id: 'platform-grouping/pneuma/index' },
          items: [
            'platform-grouping/pneuma/cluster-management',
            'platform-grouping/pneuma/service-mesh',
            'platform-grouping/pneuma/certificate-management',
            'platform-grouping/pneuma/policy-enforcement',
            'platform-grouping/pneuma/observability',
          ],
        },
        {
          type: 'category',
          label: 'Arche',
          link: { type: 'doc', id: 'platform-grouping/arche/index' },
          items: [
            'platform-grouping/arche/core-helpers',
            'platform-grouping/arche/module-development',
            'platform-grouping/arche/google-cloud',
            'platform-grouping/arche/kubernetes',
          ],
        },
        {
          type: 'category',
          label: 'Ekklesia',
          link: { type: 'doc', id: 'platform-grouping/ekklesia/index' },
          items: [
            'platform-grouping/ekklesia/documentation',
          ],
        },
        {
          type: 'category',
          label: 'Kryptos',
          link: { type: 'doc', id: 'platform-grouping/kryptos/index' },
          items: [
            'platform-grouping/kryptos/open-bao',
          ],
        },
        {
          type: 'category',
          label: 'Techne',
          link: { type: 'doc', id: 'platform-grouping/techne/index' },
          items: [
            'platform-grouping/techne/deployment-automation',
            'platform-grouping/techne/developer-experience',
          ],
        },
        // endregion: platform-grouping
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
