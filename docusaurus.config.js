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
    mermaid: true,
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
          routeBasePath: 'home',
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
        docsRouteBasePath: '/home',
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
            to: '/',
            label: 'Home',
            position: 'left',
            activeBaseRegex: '^/$',
          },
          {
            type: 'dropdown',
            label: 'Platform Teams',
            position: 'left',
            items: [
              {label: 'Logos — Organization', to: '/home/platform-teams/logos'},
              {label: 'Corpus — Infrastructure', to: '/home/platform-teams/corpus'},
              {label: 'Pneuma — Kubernetes', to: '/home/platform-teams/pneuma'},
              {label: 'Arche — Modules', to: '/home/platform-teams/arche'},
              {label: 'Techne — Tooling', to: '/home/platform-teams/techne'},
              {label: 'Ekklesia — Documentation', to: '/home/platform-teams/ekklesia'},
            ],
          },
          {
            type: 'dropdown',
            label: 'Stream-Aligned Teams',
            position: 'left',
            items: [
              {label: 'Ethos — Philosophy', to: '/home/stream-aligned-teams/ethos'},
            ],
          },
          {
            href: 'https://github.com/osinfra-io',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub Organization',
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
