import "server-only";

import https from "node:https";
import type { IpWhoResponse } from "./types";

export type IpWhoLookupOptions = {
  timeoutMs?: number;
  language?: string;
};

function buildUrl(ip: string | null, opts: IpWhoLookupOptions): URL {
  const base = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : "https://ipwho.is/";
  const url = new URL(base);
  if (opts.language) url.searchParams.set("lang", opts.language);
  return url;
}

export async function lookupIpWho(
  ip: string | null,
  opts: IpWhoLookupOptions = {},
): Promise<IpWhoResponse> {
  const timeoutMs = opts.timeoutMs ?? 1500;
  const url = buildUrl(ip, opts);

  try {
    // Note: some environments get blocked when using Node's built-in fetch (Undici).
    // Using a plain HTTPS request here is more reliable.
    const raw = await new Promise<string>((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "user-agent": "ip-detect/0.1 (+server)",
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        },
      );

      req.on("error", reject);
      req.setTimeout(timeoutMs, () => req.destroy(new Error("ipwho.is request timeout")));
      req.end();
    });

    const data = JSON.parse(raw) as IpWhoResponse;
    if (!data || typeof data !== "object") {
      return { ip: ip ?? "", success: false, message: "Invalid ipwho.is response" };
    }
    return data;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error while calling ipwho.is";
    return { ip: ip ?? "", success: false, message };
  }
}

