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
          items: [],
        },
        {
          type: 'category',
          label: 'Corpus',
          link: { type: 'doc', id: 'platform-teams/corpus/index' },
          items: [
            'platform-teams/corpus/networking',
          ],
        },
        {
          type: 'category',
          label: 'Pneuma',
          link: { type: 'doc', id: 'platform-teams/pneuma/index' },
          items: [],
        },
        {
          type: 'category',
          label: 'Arche',
          link: { type: 'doc', id: 'platform-teams/arche/index' },
          items: [],
        },
        {
          type: 'category',
          label: 'Ekklesia',
          link: { type: 'doc', id: 'platform-teams/ekklesia/index' },
          items: [],
        },
        {
          type: 'category',
          label: 'Techne',
          link: { type: 'doc', id: 'platform-teams/techne/index' },
          items: [],
        },
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
