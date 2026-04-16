export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export type IpWhoResponse = {
  ip: string;
  success: boolean;
  type?: string;
  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_eu?: boolean;
  postal?: string;
  calling_code?: string;
  capital?: string;
  borders?: string;
  flag?: { img?: string; emoji?: string; emoji_unicode?: string };
  connection?: { asn?: number; org?: string; isp?: string; domain?: string };
  timezone?: { id?: string; abbr?: string; is_dst?: boolean; offset?: number; utc?: string };
  message?: string;
};

export type VisitorContext = {
  capturedAt: string;
  ip: string | null;
  ipSource: string | null;
  userAgent: string | null;
  device: {
    type: DeviceType;
    vendor: string | null;
    model: string | null;
  };
  os: {
    name: string | null;
    version: string | null;
  };
  browser: {
    name: string | null;
    version: string | null;
  };
  geo: {
    continent: string | null;
    continentCode: string | null;
    country: string | null;
    countryCode: string | null;
    region: string | null;
    regionCode: string | null;
    city: string | null;
    postal: string | null;
    latitude: number | null;
    longitude: number | null;
    isEu: boolean | null;
    timezone: {
      id: string | null;
      abbr: string | null;
      utc: string | null;
      offset: number | null;
      isDst: boolean | null;
    };
  };
  network: {
    ipType: string | null;
    isp: string | null;
    org: string | null;
    asn: number | null;
    domain: string | null;
  };
  raw: {
    ipwho: IpWhoResponse | null;
  };
};

