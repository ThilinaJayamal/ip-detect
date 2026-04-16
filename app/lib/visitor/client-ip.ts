import "server-only";

export type ClientIpResult = {
  ip: string | null;
  source: string | null;
};

function firstPublicIpFromXForwardedFor(value: string): string | null {
  // X-Forwarded-For is a comma-separated list (client, proxy1, proxy2, ...)
  // We take the first syntactically-valid IP-like token; proxy chains differ by provider.
  for (const raw of value.split(",")) {
    const candidate = raw.trim();
    if (!candidate) continue;
    // Strip IPv6 zone index if present (e.g. "fe80::1%lo0")
    const withoutZone = candidate.replace(/%.+$/, "");
    // Strip brackets if present (e.g. "[::1]")
    const unwrapped = withoutZone.replace(/^\[|\]$/g, "");
    if (looksLikeIp(unwrapped)) return unwrapped;
  }
  return null;
}

function looksLikeIp(value: string): boolean {
  // Not perfect validation; good enough for extraction and avoids pulling in heavy deps.
  if (!value) return false;
  const v = value.trim();
  if (v.includes(":")) return true; // IPv6-ish
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return true; // IPv4-ish
  return false;
}

export function getClientIpFromHeaders(headers: Headers): ClientIpResult {
  const cf = headers.get("cf-connecting-ip");
  if (cf && looksLikeIp(cf)) return { ip: cf.trim(), source: "cf-connecting-ip" };

  const real = headers.get("x-real-ip");
  if (real && looksLikeIp(real)) return { ip: real.trim(), source: "x-real-ip" };

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = firstPublicIpFromXForwardedFor(forwarded);
    if (ip) return { ip, source: "x-forwarded-for" };
  }

  // Some CDNs use this.
  const fastly = headers.get("fastly-client-ip");
  if (fastly && looksLikeIp(fastly)) return { ip: fastly.trim(), source: "fastly-client-ip" };

  // As a last resort, some proxies put it here.
  const forwardedFor = headers.get("forwarded");
  if (forwardedFor) {
    const match = forwardedFor.match(/for=([^;,\s]+)/i);
    const ipRaw = match?.[1]?.replace(/^"|"$/g, "");
    if (ipRaw) {
      const ip = ipRaw.replace(/^\[|\]$/g, "");
      if (looksLikeIp(ip)) return { ip, source: "forwarded" };
    }
  }

  return { ip: null, source: null };
}

