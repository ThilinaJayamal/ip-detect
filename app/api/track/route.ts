import type { NextRequest } from "next/server";

import { buildVisitorContext } from "@/app/lib/visitor/context";
import { trackVisitor } from "@/app/lib/visitor/sink";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = await buildVisitorContext(request.headers, { ipWhoTimeoutMs: 1500 });

  await trackVisitor({
    context,
    route: new URL(request.url).pathname,
    method: request.method,
    referer: request.headers.get("referer"),
  });

  return Response.json({ ok: true, context });
}

export async function GET(request: NextRequest) {
  // Convenience for quick testing in the browser.
  const context = await buildVisitorContext(request.headers, { ipWhoTimeoutMs: 1500 });
  return Response.json({ ok: true, context });
}

