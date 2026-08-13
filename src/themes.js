/* ChatGPT Themer — definición de temas y ajustes compartidos
   Se carga tanto en el content script como en el popup (scope global: window.CT). */
(function (root) {
  'use strict';

  /** Variables CSS de ChatGPT agrupadas por "rol" de color.
   *  Cada rol se mapea a varias variables reales para cubrir los distintos
   *  nombres que ha ido usando la interfaz a lo largo de sus versiones. */
  const VARMAP = {
    mainSurfacePrimary: [
      '--main-surface-primary',
      '--main-surface-background',
      '--surface-primary',
      '--bg-primary-strong'
    ],
    mainSurfaceSecondary: [
      '--main-surface-secondary',
      '--surface-secondary',
      '--composer-surface',
      '--message-surface'
    ],
    mainSurfaceTertiary: ['--main-surface-tertiary', '--surface-tertiary'],
    sidebarSurfacePrimary: ['--sidebar-surface-primary'],
    sidebarSurfaceSecondary: ['--sidebar-surface-secondary'],
    sidebarSurfaceTertiary: ['--sidebar-surface-tertiary'],
    textPrimary: ['--text-primary', '--token-text-primary'],
    textSecondary: ['--text-secondary', '--token-text-secondary'],
    textTertiary: ['--text-tertiary', '--token-text-tertiary'],
    borderLight: ['--border-light', '--border-default'],
    borderMedium: ['--border-medium'],
    borderHeavy: ['--border-heavy'],
    bgPrimary: ['--bg-primary'],
    bgSecondary: ['--bg-secondary']
  };

  const ACCENT_VARS = [
    '--interactive-label-default-accent',
    '--interactive-label-hover-accent',
    '--interactive-label-press-accent',
    '--interactive-bg-default-accent-secondary',
    '--interactive-bg-hover-accent-secondary',
    '--interactive-bg-accent-default',
    '--link'
  ];

  /** Azúcar sintáctico para declarar temas sin repetir los bordes. */
  function mk(o) {
    const dark = o.dark !== false;
    return {
      name: o.name,
      group: o.group || (dark ? 'dark' : 'light'),
      dark,
      swatch: [o.side || o.main, o.main2, o.accent],
      accent: o.accent,
      vars: {
        mainSurfacePrimary: o.main,
        mainSurfaceSecondary: o.main2,
        mainSurfaceTertiary: o.main3,
        sidebarSurfacePrimary: o.side || o.main,
        sidebarSurfaceSecondary: o.main2,
        sidebarSurfaceTertiary: o.main3,
        textPrimary: o.text,
        textSecondary: o.text2,
        textTertiary: o.text3,
        borderLight: dark ? '#ffffff12' : '#00000010',
        borderMedium: dark ? '#ffffff26' : '#00000024',
        borderHeavy: dark ? '#ffffff3a' : '#00000038',
        bgPrimary: o.main2,
        bgSecondary: o.main3
      }
    };
  }

  const THEMES = {
    default: {
      name: 'Original',
      group: 'dark',
      dark: true,
      swatch: ['#171717', '#303030', '#3a83f7'],
      vars: null,
      accent: null
    },

    /* ---------------- Oscuros ---------------- */
    nord: mk({
      name: 'Nord', accent: '#88c0d0',
      main: '#2e3440', main2: '#3b4252', main3: '#434c5e', side: '#262b33',
      text: '#eceff4', text2: '#d8dee9', text3: '#a3adc2'
    }),
    dracula: mk({
      name: 'Drácula', accent: '#bd93f9',
      main: '#282a36', main2: '#2f3140', main3: '#383a4d', side: '#21222c',
      text: '#f8f8f2', text2: '#cbccc7', text3: '#8b8fa3'
    }),
    tokyo: mk({
      name: 'Tokyo Night', accent: '#7aa2f7',
      main: '#1a1b26', main2: '#22243a', main3: '#2f334d', side: '#16161e',
      text: '#c0caf5', text2: '#a9b1d6', text3: '#7d84a8'
    }),
    catppuccin: mk({
      name: 'Catppuccin', accent: '#cba6f7',
      main: '#1e1e2e', main2: '#282a3c', main3: '#313244', side: '#181825',
      text: '#cdd6f4', text2: '#bac2de', text3: '#9399b2'
    }),
    gruvbox: mk({
      name: 'Gruvbox', accent: '#fabd2f',
      main: '#282828', main2: '#32302f', main3: '#3c3836', side: '#1d2021',
      text: '#ebdbb2', text2: '#d5c4a1', text3: '#a89984'
    }),
    solarized: mk({
      name: 'Solarizado', accent: '#2aa198',
      main: '#002b36', main2: '#073642', main3: '#0a4152', side: '#00212a',
      text: '#eee8d5', text2: '#93a1a1', text3: '#839496'
    }),
    ocean: mk({
      name: 'Océano', accent: '#3a86ff',
      main: '#0b132b', main2: '#1c2541', main3: '#253a5e', side: '#060a1a',
      text: '#e6f1ff', text2: '#a9c1dd', text3: '#7c96b8'
    }),
    forest: mk({
      name: 'Bosque', accent: '#a7c080',
      main: '#232a2e', main2: '#2d353b', main3: '#343f44', side: '#1e2326',
      text: '#d3c6aa', text2: '#bcc4bb', text3: '#889390'
    }),
    rosepine: mk({
      name: 'Rosé Pine', accent: '#ebbcba',
      main: '#191724', main2: '#1f1d2e', main3: '#26233a', side: '#13111d',
      text: '#e0def4', text2: '#c9c5dd', text3: '#908caa'
    }),
    monokai: mk({
      name: 'Monokai', accent: '#a6e22e',
      main: '#272822', main2: '#2f302a', main3: '#3e3d32', side: '#1e1f1c',
      text: '#f8f8f2', text2: '#cfcfc2', text3: '#90918b'
    }),
    coffee: mk({
      name: 'Café', accent: '#d3a47a',
      main: '#241c17', main2: '#2f2620', main3: '#3b302a', side: '#1b1511',
      text: '#f2e6da', text2: '#d8c6b5', text3: '#a8968a'
    }),
    midnight: mk({
      name: 'Medianoche', group: 'special', accent: '#4d9fff',
      main: '#000000', main2: '#0a0a0a', main3: '#141414', side: '#000000',
      text: '#f5f5f5', text2: '#c4c4c4', text3: '#8a8a8a'
    }),
    synthwave: mk({
      name: 'Synthwave', group: 'special', accent: '#ff2e88',
      main: '#1a1030', main2: '#241546', main3: '#2f1c5c', side: '#120a24',
      text: '#f7e9ff', text2: '#d7b8ef', text3: '#a888c8'
    }),
    matrix: mk({
      name: 'Matrix', group: 'special', accent: '#00ff9c',
      main: '#04120b', main2: '#081c12', main3: '#0d2a1b', side: '#020c07',
      text: '#c9ffe4', text2: '#7fe0b3', text3: '#4d9e7c'
    }),
    cyberpunk: mk({
      name: 'Cyberpunk', group: 'special', accent: '#fcee0a',
      main: '#0f1014', main2: '#171a21', main3: '#20242e', side: '#08090c',
      text: '#e9fbff', text2: '#a7e8f2', text3: '#6f8f9c'
    }),

    /* ---------------- Claros ---------------- */
    light: mk({
      name: 'Claro', dark: false, accent: '#2f6fed',
      main: '#ffffff', main2: '#f7f7f8', main3: '#ececf1', side: '#f9f9f9',
      text: '#1a1a1a', text2: '#4d4d4d', text3: '#6e6e6e'
    }),
    latte: mk({
      name: 'Latte', dark: false, accent: '#8839ef',
      main: '#eff1f5', main2: '#e6e9ef', main3: '#dce0e8', side: '#e6e9ef',
      text: '#4c4f69', text2: '#5c5f77', text3: '#7c7f93'
    }),
    sepia: mk({
      name: 'Sepia', dark: false, accent: '#a1662f',
      main: '#f6efe2', main2: '#efe6d5', main3: '#e4d8c2', side: '#efe6d5',
      text: '#3b3228', text2: '#5c5040', text3: '#7d6f5c'
    }),
    solarLight: mk({
      name: 'Solar claro', dark: false, accent: '#268bd2',
      main: '#fdf6e3', main2: '#f5eed8', main3: '#eee8d5', side: '#f5eed8',
      text: '#073642', text2: '#586e75', text3: '#839496'
    }),
    mint: mk({
      name: 'Menta', dark: false, accent: '#0f9d76',
      main: '#f4faf7', main2: '#e9f4ef', main3: '#dcece5', side: '#e9f4ef',
      text: '#16302a', text2: '#3a5a51', text3: '#5f7d74'
    })
  };

  const GROUPS = [
    { id: 'dark', label: 'Oscuros' },
    { id: 'light', label: 'Claros' },
    { id: 'special', label: 'Especiales' }
  ];

  const FONTS = {
    '': 'Por defecto',
    'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif': 'Sistema',
    'Georgia, "Times New Roman", serif': 'Serif',
    '"Iowan Old Style", "Palatino Linotype", Palatino, serif': 'Editorial',
    'ui-monospace, SFMono-Regular, "Cascadia Mono", Menlo, monospace': 'Monoespaciada'
  };

  const DEFAULTS = {
    enabled: true,
    theme: 'default',
    accent: '',        // '' = usa el acento del tema
    fontSize: 16,      // px sobre :root (0/16 = por defecto)
    chatWidth: 0,      // rem; 0 = por defecto de ChatGPT
    fontFamily: '',
    compact: false,
    hideAvatars: false,
    showWidget: true
  };

  const STORAGE_KEY = 'settings';
  const CACHE_KEY = 'cgptThemer:cache'; // espejo en localStorage para aplicar sin parpadeo

  /** Genera todo el CSS a inyectar en la página a partir de los ajustes. */
  function buildCSS(s) {
    s = Object.assign({}, DEFAULTS, s || {});
    if (!s.enabled) return '';

    const theme = THEMES[s.theme] || THEMES.default;
    const out = [];

    const decls = [];
    if (theme.vars) {
      Object.keys(VARMAP).forEach(function (role) {
        const value = theme.vars[role];
        if (!value) return;
        VARMAP[role].forEach(function (cssVar) {
          decls.push(cssVar + ': ' + value + ' !important;');
        });
      });
    }
    const accent = s.accent || theme.accent;
    if (accent) {
      ACCENT_VARS.forEach(function (v) {
        decls.push(v + ': ' + accent + ' !important;');
      });
    }
    if (decls.length) {
      // El universal es necesario: ChatGPT redefine estas variables en
      // contenedores internos según el modo claro/oscuro.
      out.push('html, html.dark, html:not(.dark), html *, html.dark *, html:not(.dark) * {' + decls.join('') + '}');
    }

    if (theme.vars) {
      out.push('html { color-scheme: ' + (theme.dark ? 'dark' : 'light') + ' !important; }');
      out.push('html, body { background-color: ' + theme.vars.mainSurfacePrimary + ' !important; }');
      out.push('::selection { background: ' + hexA(accent, 0.35) + '; }');
      out.push('* { scrollbar-color: ' + (theme.dark ? '#ffffff2e' : '#00000026') + ' transparent; }');
    }

    if (s.fontSize && s.fontSize !== DEFAULTS.fontSize) {
      out.push('html { font-size: ' + s.fontSize + 'px !important; }');
    }
    if (s.chatWidth) {
      out.push(':root { --thread-content-max-width: ' + s.chatWidth + 'rem !important;' +
        ' --thread-content-max-width-md: ' + s.chatWidth + 'rem !important; }');
    }
    if (s.fontFamily) {
      out.push('html, body, main, textarea, input, button, .markdown, [class*="prose"] { font-family: ' + s.fontFamily + ' !important; }');
      out.push('code, pre, kbd, samp, pre * { font-family: ui-monospace, SFMono-Regular, "Cascadia Mono", Menlo, monospace !important; }');
    }
    if (s.compact) {
      out.push('main article { padding-block: 6px !important; }');
      out.push('main [data-message-author-role] { line-height: 1.5 !important; }');
      out.push('main .markdown > * + * { margin-top: .6em !important; }');
    }
    if (s.hideAvatars) {
      out.push('main [data-message-author-role] img[alt], main .agent-turn > div > div:first-child img { display: none !important; }');
    }
    if (!s.showWidget) {
      out.push('#cgpt-themer-widget { display: none !important; }');
    }
    return out.join('\n');
  }

  /** #rrggbb + alfa -> rgba(). Devuelve el color tal cual si no puede parsearlo. */
  function hexA(hex, alpha) {
    if (!hex) return 'rgba(125,125,125,' + alpha + ')';
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  root.CT = {
    THEMES: THEMES,
    GROUPS: GROUPS,
    FONTS: FONTS,
    DEFAULTS: DEFAULTS,
    STORAGE_KEY: STORAGE_KEY,
    CACHE_KEY: CACHE_KEY,
    buildCSS: buildCSS,
    hexA: hexA
  };
})(typeof self !== 'undefined' ? self : this);
