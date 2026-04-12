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
        {
          type: 'category',
          label: 'Corpus',
          link: { type: 'doc', id: 'platform-teams/corpus/index' },
          items: [
            'platform-teams/corpus/networking',
          ],
        },
        'platform-teams/pneuma',
        'platform-teams/arche',
        'platform-teams/ekklesia',
        'platform-teams/techne',
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
