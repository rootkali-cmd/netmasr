import { NextRequest, NextResponse } from "next/server";

const ADMIN_PANEL_PATH = process.env.ADMIN_PANEL_PATH || "control-panel";
const ADMIN_GATE_SECRET = process.env.ADMIN_GATE_SECRET || "";
const GATE_COOKIE = "admin_gate";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/control-panel") ||
    pathname === "/control-panel"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    pathname === `/${ADMIN_PANEL_PATH}` ||
    pathname.startsWith(`/${ADMIN_PANEL_PATH}/`)
  ) {
    if (ADMIN_GATE_SECRET) {
      const gateParam = req.nextUrl.searchParams.get("gate");
      const gateCookie = req.cookies.get(GATE_COOKIE)?.value;

      if (gateParam === ADMIN_GATE_SECRET) {
        const cleanPath = pathname.split("?")[0];
        const internalPath = cleanPath.replace(
          `/${ADMIN_PANEL_PATH}`,
          "/control-panel"
        );
        const response = NextResponse.rewrite(
          new URL(internalPath, req.url)
        );
        response.cookies.set(GATE_COOKIE, "valid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 12 * 60 * 60,
          path: "/",
        });
        return response;
      }

      if (gateCookie === "valid") {
        const url = req.nextUrl.clone();
        url.pathname = pathname.replace(
          `/${ADMIN_PANEL_PATH}`,
          "/control-panel"
        );
        return NextResponse.rewrite(url);
      }

      return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace(
        `/${ADMIN_PANEL_PATH}`,
        "/control-panel"
      );
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/control-panel/:path*",
    "/:path*",
  ],
};
