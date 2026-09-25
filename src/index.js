/**
 * Free IP-API & Geodata powered by Cloudflare Workers
 * Repository: https://github.com/appshubcc/ipinfo
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
const EMOJI_FLAG_OFFSET = 127397;

function getFlag(countryCode) {
  if (!countryCode || typeof countryCode !== "string") return null;
  const upperCode = countryCode.toUpperCase();
  if (!COUNTRY_CODE_REGEX.test(upperCode)) return null;

  try {
    return String.fromCodePoint(
      ...Array.from(upperCode, (char) => EMOJI_FLAG_OFFSET + char.charCodeAt(0))
    );
  } catch {
    return null;
  }
}

function getClientIP(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1"
  );
}

export default {
  async fetch(request) {
    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...CORS_HEADERS,
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const ip = getClientIP(request);
    const { pathname, searchParams } = new URL(request.url);
    const acceptHeader = request.headers.get("accept") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const isJsonRequested =
      pathname === "/json" ||
      searchParams.get("format") === "json" ||
      acceptHeader.includes("application/json");

    const responseHeaders = {
      ...CORS_HEADERS,
      ...CACHE_HEADERS,
      "x-client-ip": ip,
    };

    if (isJsonRequested) {
      const cf = request.cf || {};
      const country = cf.country || request.headers.get("cf-ipcountry") || null;
      const colo = request.headers.get("cf-ray")?.split("-")[1] || cf.colo || null;

      const payload = {
        ip,
        flag: getFlag(country),
        country,
        countryRegion: cf.region || request.headers.get("cf-region") || null,
        city: cf.city || request.headers.get("cf-ipcity") || null,
        region: colo,
        latitude: cf.latitude || request.headers.get("cf-iplatitude") || null,
        longitude: cf.longitude || request.headers.get("cf-iplongitude") || null,
        asn: cf.asn != null ? `AS${cf.asn}` : null,
        asOrganization: cf.asOrganization || request.headers.get("x-asn") || null,
      };

      return Response.json(payload, {
        headers: {
          ...responseHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    // curl/wget/httpie
    const isCli = /curl|wget|httpie/i.test(userAgent);
    const responseText = isCli ? `${ip}\n` : ip;

    return new Response(responseText, {
      headers: {
        ...responseHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  },
};
