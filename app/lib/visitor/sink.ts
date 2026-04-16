import "server-only";

import type { VisitorContext } from "./types";

export type TrackVisitorInput = {
  context: VisitorContext;
  route: string | null;
  method: string | null;
  referer: string | null;
};

export async function trackVisitor(input: TrackVisitorInput): Promise<void> {
  // Default sink: structured log. Replace this function with a DB/queue implementation.
  // Keep it server-only and side-effectful, so routes/pages can call it consistently.
  console.info("visitor.track", {
    capturedAt: input.context.capturedAt,
    route: input.route,
    method: input.method,
    referer: input.referer,
    ip: input.context.ip,
    country: input.context.geo.countryCode,
    region: input.context.geo.regionCode,
    city: input.context.geo.city,
    device: input.context.device.type,
    isp: input.context.network.isp,
    asn: input.context.network.asn,
  });
}

