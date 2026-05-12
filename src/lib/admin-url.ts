export const ADMIN_PANEL_PATH =
  process.env.NEXT_PUBLIC_ADMIN_PANEL_PATH ||
  process.env.ADMIN_PANEL_PATH ||
  "control-panel";

export const GATE_COOKIE = "admin_gate";

export function adminUrl(path = ""): string {
  const base = `/${ADMIN_PANEL_PATH}`;
  if (!path) return base;
  return `${base}/${path.replace(/^\//, "")}`;
}

export function getAdminPanelPath(): string {
  return ADMIN_PANEL_PATH;
}
