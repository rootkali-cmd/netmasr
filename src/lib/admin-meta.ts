import { type Metadata } from "next";
import { ADMIN_PANEL_PATH } from "./admin-url";

export const controlPanelMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export function getAdminHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}
