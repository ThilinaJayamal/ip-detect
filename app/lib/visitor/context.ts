import "server-only";

import { getClientIpFromHeaders } from "./client-ip";
import { parseUserAgent } from "./device";
import { lookupIpWho } from "./ipwho";
import type { VisitorContext } from "./types";

export type BuildVisitorContextOptions = {
  ipWhoTimeoutMs?: number;
  language?: string;
};

export async function buildVisitorContext(
  headers: Headers,
  opts: BuildVisitorContextOptions = {},
): Promise<VisitorContext> {
  const { ip, source: ipSource } = getClientIpFromHeaders(headers);
  const userAgent = headers.get("user-agent");
  const ua = parseUserAgent(userAgent);

  const ipWho = await lookupIpWho(ip, {
    timeoutMs: opts.ipWhoTimeoutMs ?? 1500,
    language: opts.language,
  });

  return {
    capturedAt: new Date().toISOString(),
    ip,
    ipSource,
    userAgent,
    device: {
      type: ua.device.type,
      vendor: ua.device.vendor,
      model: ua.device.model,
    },
    os: { name: ua.os.name, version: ua.os.version },
    browser: { name: ua.browser.name, version: ua.browser.version },
    geo: {
      continent: ipWho.success ? ipWho.continent ?? null : null,
      continentCode: ipWho.success ? ipWho.continent_code ?? null : null,
      country: ipWho.success ? ipWho.country ?? null : null,
      countryCode: ipWho.success ? ipWho.country_code ?? null : null,
      region: ipWho.success ? ipWho.region ?? null : null,
      regionCode: ipWho.success ? ipWho.region_code ?? null : null,
      city: ipWho.success ? ipWho.city ?? null : null,
      postal: ipWho.success ? ipWho.postal ?? null : null,
      latitude: ipWho.success ? ipWho.latitude ?? null : null,
      longitude: ipWho.success ? ipWho.longitude ?? null : null,
      isEu: ipWho.success ? ipWho.is_eu ?? null : null,
      timezone: {
        id: ipWho.success ? ipWho.timezone?.id ?? null : null,
        abbr: ipWho.success ? ipWho.timezone?.abbr ?? null : null,
        utc: ipWho.success ? ipWho.timezone?.utc ?? null : null,
        offset: ipWho.success ? ipWho.timezone?.offset ?? null : null,
        isDst: ipWho.success ? ipWho.timezone?.is_dst ?? null : null,
      },
    },
    network: {
      ipType: ipWho.success ? ipWho.type ?? null : null,
      isp: ipWho.success ? ipWho.connection?.isp ?? null : null,
      org: ipWho.success ? ipWho.connection?.org ?? null : null,
      asn: ipWho.success ? ipWho.connection?.asn ?? null : null,
      domain: ipWho.success ? ipWho.connection?.domain ?? null : null,
    },
    raw: { ipwho: ipWho },
  };
}

