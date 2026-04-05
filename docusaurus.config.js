// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'osinfra.io',
  tagline: 'Open Source Infrastructure as Code',
  favicon: 'img/favicon.ico',

  url: 'https://docs.osinfra.io',
  baseUrl: '/',

  organizationName: 'osinfra-io',
  projectName: 'pt-ekklesia-docs',

  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/osinfra-io/pt-ekklesia-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'osinfra.io',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/osinfra-io',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/osinfra-io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} osinfra.io`,
      },
      prism: {
        additionalLanguages: ['hcl', 'bash'],
      },
    }),
};

export default config;
