/**
 * Cliniq — Ant Design themes
 *
 * Two configs. `cliniqDarkTheme` is the app default — the whole site runs on
 * the dark ground now, so antd has to match or every dropdown, modal and
 * picker arrives as a white panel over a dark page. `cliniqTheme` is the
 * original light config, kept so the change is reversible and so any subtree
 * that needs a light shell can wrap itself in its own <ConfigProvider>.
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
  /* Rosewood is ~1.5:1 on the dark ground; this is the readable stand-in
     for anything drawing text or links in the accent. */
  accentLine: '#E2CBCE',
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

    colorBgBase:      '#0A0A0A',
    colorBgLayout:    '#0A0A0A',
    colorBgContainer: '#141414',
    colorBgElevated:  '#1F1F1F',

    colorBorder:          'rgba(241, 236, 230, 0.14)',
    colorBorderSecondary: 'rgba(241, 236, 230, 0.09)',

    colorTextDescription: 'rgba(241, 236, 230, 0.64)',
    colorTextPlaceholder: 'rgba(241, 236, 230, 0.40)',

    colorLink:      mono.accentLine,
    colorLinkHover: mono.n100,

    /* Shadows on a near-black ground have to be darker than the surface,
       not a tinted version of it, or they read as a glow. */
    boxShadow:          '0 2px 10px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary: '0 12px 32px rgba(0, 0, 0, 0.55)',
  },
  components: {
    ...sharedComponents,
    Button: { ...sharedComponents.Button, primaryColor: '#0A0A0A' },
    Table:  { headerBg: '#141414', rowHoverBg: '#141414', borderColor: 'rgba(241,236,230,0.09)' },
    Input:  { paddingBlock: 9, activeShadow: '0 0 0 3px rgba(241, 236, 230, 0.34)' },
    Segmented: { itemSelectedBg: mono.n100, itemSelectedColor: '#0A0A0A' },
    /* The light config sets these; without dark counterparts the dropdowns,
       tags and pickers keep antd's own surfaces and show up as white panels
       over a dark page. */
    Tag:        { ...sharedComponents.Tag, defaultBg: '#1F1F1F', defaultColor: 'rgba(241, 236, 230, 0.88)' },
    Select:     { optionSelectedBg: '#1F1F1F', optionSelectedColor: mono.n100 },
    DatePicker: { activeShadow: '0 0 0 3px rgba(241, 236, 230, 0.34)', cellHoverBg: '#1F1F1F' },
    Menu:       { ...sharedComponents.Menu, itemSelectedBg: '#1F1F1F', itemSelectedColor: mono.n100, itemHoverBg: '#141414' },
    Dropdown:   { colorBgElevated: '#1F1F1F' },
    Modal:      { ...sharedComponents.Modal, contentBg: '#141414', headerBg: '#141414' },
    Tooltip:    { colorBgSpotlight: '#1F1F1F', colorTextLightSolid: mono.n100 },
    Message:    { contentBg: '#1F1F1F' },
    Notification: { colorBgElevated: '#1F1F1F' },
  },
};

export default cliniqTheme;
