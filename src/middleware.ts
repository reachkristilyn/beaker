import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const expectedUser = process.env.WALL_DESIGNER_USER;
  const expectedPass = process.env.WALL_DESIGNER_PASSWORD;

  const auth = req.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6)); // "user:pass"
      const idx = decoded.indexOf(":");
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    } catch {
      // malformed header — fall through to the 401 below
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Wall Designer", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/wall-designer", "/wall-designer/:path*"],
};