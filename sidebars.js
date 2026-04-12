// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Platform Teams',
      link: { type: 'doc', id: 'platform-teams/index' },
      items: [
        'platform-teams/logos/index',
        {
          type: 'category',
          label: 'Corpus',
          link: { type: 'doc', id: 'platform-teams/corpus/index' },
          items: [
            'platform-teams/corpus/project-factory',
            'platform-teams/corpus/networking',
            'platform-teams/corpus/ci-cd',
          ],
        },
        'platform-teams/pneuma/index',
        'platform-teams/arche/index',
        'platform-teams/ekklesia/index',
        'platform-teams/techne/index',
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
  ],
};

export default sidebars;
