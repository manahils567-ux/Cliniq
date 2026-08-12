/**
 * Cliniq — Ant Design themes
 *
 * Two configs. `cliniqTheme` for app surfaces (dashboard, admin, forms).
 * `cliniqDarkTheme` for anything rendered inside a .cq-dark shell —
 * wrap that subtree in its own <ConfigProvider>.
 *
 * Values MUST stay in sync with styles/tokens.css. AntD generates CSS at
 * runtime and cannot read var(--n-950), so the hexes are duplicated here.
 * That is the one piece of duplication this system accepts.
 */

import { theme as antdTheme } from 'antd';

export const mono = {
  n000: '#FFFFFF', n050: '#FAF8F5', n100: '#F1ECE6', n200: '#DDD5CD',
  n300: '#C7BDB3', n400: '#90867C', n500: '#736A61', n600: '#635B54',
  n700: '#47413C', n800: '#2E2E2E', n900: '#232322', n950: '#191918',
  accent: '#7D4047', accentHover: '#663339', accentWash: '#F5EBEC',
  signal: '#C08A2E', danger: '#B3261E', positive: '#2F6B4F',
  fontUI: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

/* Shared across both modes — geometry and type never change with theme. */
const shared = {
  fontFamily: mono.fontUI,
  fontSize: 15,
  borderRadius: 8,
  borderRadiusLG: 14,
  borderRadiusSM: 4,
  controlHeight: 40,
  lineWidth: 1,
  wireframe: false,
  motionDurationMid: '0.28s',
  motionEaseInOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
};

const sharedComponents = {
  Button:  { fontWeight: 500, primaryShadow: 'none', paddingInline: 22, borderRadius: 999 },
  Card:    { headerFontSize: 17, paddingLG: 24 },
  Tag:     { borderRadiusSM: 999 },
  Modal:   { titleFontSize: 20, borderRadiusLG: 14 },
  Menu:    { itemBorderRadius: 8 },
  Segmented: { itemSelectedBg: mono.accent, itemSelectedColor: mono.n000 },
};

/* ---- Light: dashboard, admin, forms ---------------------------------- */
const cliniqTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    ...shared,
    colorPrimary: mono.accent,
    colorSuccess: mono.positive,
    colorWarning: mono.signal,
    colorError:   mono.danger,
    colorInfo:    mono.n700,

    colorText:            mono.n700,
    colorTextHeading:     mono.n900,
    colorTextSecondary:   mono.n500,
    colorTextDescription: mono.n500,
    colorTextPlaceholder: mono.n400,

    colorBgBase:      mono.n000,
    colorBgLayout:    mono.n100,
    colorBgContainer: mono.n000,
    colorBgElevated:  mono.n000,

    colorBorder:          mono.n200,
    colorBorderSecondary: mono.n100,

    colorLink:       mono.accent,
    colorLinkHover:  mono.accentHover,

    boxShadow:          '0 2px 10px rgba(46, 46, 46, 0.08)',
    boxShadowSecondary: '0 12px 32px rgba(46, 46, 46, 0.14)',
  },
  components: {
    ...sharedComponents,
    Table: { headerBg: mono.n100, headerColor: mono.n500, rowHoverBg: mono.n050, borderColor: mono.n200 },
    Tag:   { ...sharedComponents.Tag, defaultBg: mono.n100, defaultColor: mono.n700 },
    Input: { paddingBlock: 9, activeShadow: '0 0 0 3px rgba(125, 64, 71, 0.28)', activeBorderColor: mono.accent },
    Select:{ optionSelectedBg: mono.accentWash },
    DatePicker: { activeShadow: '0 0 0 3px rgba(125, 64, 71, 0.28)' },
    Menu:  { ...sharedComponents.Menu, itemSelectedBg: mono.accentWash, itemSelectedColor: mono.accent, itemHoverBg: mono.n050 },
  },
};

/* ---- Dark: anything inside .cq-dark ---------------------------------- */
export const cliniqDarkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...shared,
    colorPrimary: mono.n100,
    colorSuccess: mono.positive,
    colorWarning: mono.signal,
    colorError:   mono.danger,

    colorText:          'rgba(241, 236, 230, 0.88)',
    colorTextHeading:   mono.n100,
    colorTextSecondary: 'rgba(241, 236, 230, 0.64)',

    colorBgBase:      mono.n800,
    colorBgLayout:    mono.n800,
    colorBgContainer: mono.n900,
    colorBgElevated:  mono.n700,

    colorBorder:          'rgba(241, 236, 230, 0.14)',
    colorBorderSecondary: 'rgba(241, 236, 230, 0.09)',
  },
  components: {
    ...sharedComponents,
    Button: { ...sharedComponents.Button, primaryColor: mono.n800 },
    Table:  { headerBg: mono.n900, rowHoverBg: mono.n900, borderColor: 'rgba(241,236,230,0.09)' },
    Input:  { paddingBlock: 9, activeShadow: '0 0 0 3px rgba(241, 236, 230, 0.34)' },
    Segmented: { itemSelectedBg: mono.n100, itemSelectedColor: mono.n800 },
  },
};

export default cliniqTheme;
