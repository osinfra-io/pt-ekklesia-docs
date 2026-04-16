// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Platform Teams',
      link: { type: 'doc', id: 'platform-teams/index' },
      items: [
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
            'platform-teams/corpus/projects',
            'platform-teams/corpus/networking',
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
        'platform-teams/kryptos/index',
        {
          type: 'category',
          label: 'Techne',
          link: { type: 'doc', id: 'platform-teams/techne/index' },
          items: [
            'platform-teams/techne/deployment-automation',
            'platform-teams/techne/developer-experience',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Stream-Aligned Teams',
      link: { type: 'doc', id: 'stream-aligned-teams/index' },
      items: [
        'stream-aligned-teams/ethos/index',
      ],
    },
    {
      type: 'category',
      label: 'Enabling Teams',
      link: { type: 'doc', id: 'enabling-teams/index' },
      items: [
        'enabling-teams/soteria/index',
        'enabling-teams/sophrosyne/index',
      ],
    },
  ],
};

export default sidebars;
