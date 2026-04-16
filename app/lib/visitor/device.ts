import "server-only";

import { UAParser } from "ua-parser-js";
import type { DeviceType } from "./types";

export type ParsedUserAgent = {
  device: { type: DeviceType; vendor: string | null; model: string | null };
  os: { name: string | null; version: string | null };
  browser: { name: string | null; version: string | null };
  isBot: boolean;
};

function toDeviceType(raw?: string): DeviceType {
  switch (raw) {
    case "mobile":
      return "mobile";
    case "tablet":
      return "tablet";
    case "console":
    case "smarttv":
    case "wearable":
    case "embedded":
      return "unknown";
    default:
      return "desktop";
  }
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      device: { type: "unknown", vendor: null, model: null },
      os: { name: null, version: null },
      browser: { name: null, version: null },
      isBot: false,
    };
  }

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  const uaLower = userAgent.toLowerCase();
  const isBot =
    uaLower.includes("bot") ||
    uaLower.includes("spider") ||
    uaLower.includes("crawler") ||
    uaLower.includes("slurp");

  const type: DeviceType = isBot
    ? "bot"
    : device.type
      ? toDeviceType(device.type)
      : "desktop";

  return {
    device: {
      type,
      vendor: device.vendor ?? null,
      model: device.model ?? null,
    },
    os: {
      name: os.name ?? null,
      version: os.version ?? null,
    },
    browser: {
      name: browser.name ?? null,
      version: browser.version ?? null,
    },
    isBot,
  };
}

