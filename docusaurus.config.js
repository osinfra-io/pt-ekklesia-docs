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
  onBrokenMarkdownLinks: 'warn',

  markdown: {
    mermaid: true,
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
          routeBasePath: '/',
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

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'osinfra.io',
        logo: {
          alt: 'osinfra.io logo',
          src: 'img/logo.png',
        },
        items: [
          {
            to: '/platform-teams',
            label: 'Teams',
            position: 'left',
          },
          {
            to: '/ecosystem',
            label: 'Ecosystem',
            position: 'left',
          },
          {
            href: 'https://github.com/sponsors/osinfra-io?frequency=one-time',
            position: 'right',
            className: 'header-sponsor-link',
            'aria-label': 'Sponsor osinfra.io',
            label: 'Sponsor',
          },
        ],
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} osinfra.io`,
      },
      prism: {
        additionalLanguages: ['hcl', 'bash'],
      },
    }),
};

export default config;
