export async function getLocationFromIP(ip) {
  if (!ip) return null;

  try {
    const url = `https://api.ip2location.io/?key=${process.env.IP2LOCATION_API_KEY}&ip=${ip}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error("❌ IP2Location API error:", res.status);
      return null;
    }

    const data = await res.json();

    return {
      ip: data.ip,
      countryCode: data.country_code,
      countryName: data.country_name,
      regionName: data.region_name,
      cityName: data.city_name,
      latitude: data.latitude,
      longitude: data.longitude,
      zipCode: data.zip_code,
      timeZone: data.time_zone,
      asn: data.asn,
      as: data.as,
      isProxy: data.is_proxy,
    };
  } catch (err) {
    console.error("❌ IP location lookup failed:", err.message);
    return null;
  }
}
