import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// CAD 几何风格 Logo
const cadLogoSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L2 10V22L16 30L30 22V10L16 2Z" stroke="#3B82F6" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="16" cy="16" r="3" fill="#3B82F6"/>
  <path d="M16 2V13M30 22L19 18M2 22L13 18" stroke="#3B82F6" stroke-width="2" stroke-dasharray="2 2"/>
</svg>
`;

const config: Config = {
  title: 'CAD & CG 研习录',
  tagline: 'Precision CAD & CG Research Workstation',
  favicon: 'data:image/svg+xml;base64,' + Buffer.from(cadLogoSvg).toString('base64'),
  url: 'https://paper-quest.example.com',
  baseUrl: '/',
  organizationName: 'paper-team',
  projectName: 'paper-notes',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFas9Dcbe5j',
      crossorigin: 'anonymous',
    },
  ],

  future: {
    faster: true,
    v4: true,
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'CAD & CG 研习录',
      logo: {
        alt: 'CAD Logo',
        src: 'data:image/svg+xml;base64,' + Buffer.from(cadLogoSvg).toString('base64'),
      },
      items: [
        {
          href: 'https://github.com/paper-team/paper-notes',
          label: 'GITHUB',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} CAD & CG 研习录.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
