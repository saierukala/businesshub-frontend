// Sidebar color palettes the user can pick (a look-only preference, kept in a cookie in this browser).
// The colors themselves live in app/sidebar-themes.css; `swatch` is only for the picker dots.

export const SIDEBAR_THEME_COOKIE = "sidebar_theme";

export const SIDEBAR_THEMES = [
  { id: "khaki", label: "Khaki", swatch: ["#d3d1b9", "#151f24", "#e82339"] },
  { id: "teal", label: "Teal", swatch: ["#284e55", "#f2f3f3", "#a95641"] },
  { id: "snow", label: "Snow", swatch: ["#fbfcfc", "#292c41", "#4ca1e4"] },
  { id: "slate", label: "Slate", swatch: ["#2e3f47", "#f4f1f1", "#716452"] },
  { id: "midnight", label: "Midnight", swatch: ["#292c41", "#fefefe", "#ef6b41"] },
  { id: "dusk", label: "Dusk", swatch: ["#373f55", "#f7f8f7", "#9d6759"] },
  { id: "navy", label: "Navy", swatch: ["#232f57", "#f1f4f2", "#ee8888"] },
  { id: "mist", label: "Mist", swatch: ["#f9f9f9", "#28282a", "#bdbd61"] },
] as const;

export type SidebarThemeId = (typeof SIDEBAR_THEMES)[number]["id"];

export const DEFAULT_SIDEBAR_THEME: SidebarThemeId = "khaki";

// Cookies can be edited by hand, so only accept a known id.
export function toSidebarTheme(value: string | undefined): SidebarThemeId {
  return SIDEBAR_THEMES.some((t) => t.id === value) ? (value as SidebarThemeId) : DEFAULT_SIDEBAR_THEME;
}

// Browser only: the palette on the page now, and switching it (on <html>, remembered for a year).
export function readSidebarTheme(): SidebarThemeId {
  return toSidebarTheme(document.documentElement.dataset.sidebarTheme);
}

export function applySidebarTheme(id: SidebarThemeId) {
  document.documentElement.dataset.sidebarTheme = id;
  document.cookie = `${SIDEBAR_THEME_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
}
