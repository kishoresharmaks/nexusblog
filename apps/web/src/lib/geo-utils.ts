export interface GeoLocation {
  country: string;
  countryName: string;
}

const TIMEZONE_TO_COUNTRY: Record<string, GeoLocation> = {
  // India & South Asia
  'Asia/Kolkata': { country: 'IN', countryName: 'India' },
  'Asia/Calcutta': { country: 'IN', countryName: 'India' },
  'Asia/Colombo': { country: 'LK', countryName: 'Sri Lanka' },
  'Asia/Dhaka': { country: 'BD', countryName: 'Bangladesh' },
  'Asia/Karachi': { country: 'PK', countryName: 'Pakistan' },
  'Asia/Kathmandu': { country: 'NP', countryName: 'Nepal' },

  // Americas
  'America/New_York': { country: 'US', countryName: 'United States' },
  'America/Chicago': { country: 'US', countryName: 'United States' },
  'America/Los_Angeles': { country: 'US', countryName: 'United States' },
  'America/Denver': { country: 'US', countryName: 'United States' },
  'America/Phoenix': { country: 'US', countryName: 'United States' },
  'America/Detroit': { country: 'US', countryName: 'United States' },
  'America/Indianapolis': { country: 'US', countryName: 'United States' },
  'America/Toronto': { country: 'CA', countryName: 'Canada' },
  'America/Vancouver': { country: 'CA', countryName: 'Canada' },
  'America/Montreal': { country: 'CA', countryName: 'Canada' },
  'America/Sao_Paulo': { country: 'BR', countryName: 'Brazil' },
  'America/Mexico_City': { country: 'MX', countryName: 'Mexico' },
  'America/Argentina/Buenos_Aires': { country: 'AR', countryName: 'Argentina' },
  'America/Bogota': { country: 'CO', countryName: 'Colombia' },
  'America/Santiago': { country: 'CL', countryName: 'Chile' },

  // Europe
  'Europe/London': { country: 'GB', countryName: 'United Kingdom' },
  'Europe/Berlin': { country: 'DE', countryName: 'Germany' },
  'Europe/Paris': { country: 'FR', countryName: 'France' },
  'Europe/Amsterdam': { country: 'NL', countryName: 'Netherlands' },
  'Europe/Rome': { country: 'IT', countryName: 'Italy' },
  'Europe/Madrid': { country: 'ES', countryName: 'Spain' },
  'Europe/Warsaw': { country: 'PL', countryName: 'Poland' },
  'Europe/Stockholm': { country: 'SE', countryName: 'Sweden' },
  'Europe/Dublin': { country: 'IE', countryName: 'Ireland' },
  'Europe/Zurich': { country: 'CH', countryName: 'Switzerland' },
  'Europe/Vienna': { country: 'AT', countryName: 'Austria' },
  'Europe/Brussels': { country: 'BE', countryName: 'Belgium' },
  'Europe/Copenhagen': { country: 'DK', countryName: 'Denmark' },
  'Europe/Helsinki': { country: 'FI', countryName: 'Finland' },
  'Europe/Oslo': { country: 'NO', countryName: 'Norway' },
  'Europe/Lisbon': { country: 'PT', countryName: 'Portugal' },
  'Europe/Prague': { country: 'CZ', countryName: 'Czech Republic' },
  'Europe/Bucharest': { country: 'RO', countryName: 'Romania' },
  'Europe/Athens': { country: 'GR', countryName: 'Greece' },
  'Europe/Kyiv': { country: 'UA', countryName: 'Ukraine' },

  // Middle East & Africa
  'Asia/Dubai': { country: 'AE', countryName: 'United Arab Emirates' },
  'Asia/Riyadh': { country: 'SA', countryName: 'Saudi Arabia' },
  'Asia/Qatar': { country: 'QA', countryName: 'Qatar' },
  'Asia/Jerusalem': { country: 'IL', countryName: 'Israel' },
  'Africa/Cairo': { country: 'EG', countryName: 'Egypt' },
  'Africa/Johannesburg': { country: 'ZA', countryName: 'South Africa' },
  'Africa/Lagos': { country: 'NG', countryName: 'Nigeria' },
  'Africa/Nairobi': { country: 'KE', countryName: 'Kenya' },

  // Asia Pacific
  'Asia/Singapore': { country: 'SG', countryName: 'Singapore' },
  'Asia/Tokyo': { country: 'JP', countryName: 'Japan' },
  'Asia/Seoul': { country: 'KR', countryName: 'South Korea' },
  'Asia/Hong_Kong': { country: 'HK', countryName: 'Hong Kong' },
  'Asia/Shanghai': { country: 'CN', countryName: 'China' },
  'Asia/Taipei': { country: 'TW', countryName: 'Taiwan' },
  'Asia/Jakarta': { country: 'ID', countryName: 'Indonesia' },
  'Asia/Kuala_Lumpur': { country: 'MY', countryName: 'Malaysia' },
  'Asia/Bangkok': { country: 'TH', countryName: 'Thailand' },
  'Asia/Manila': { country: 'PH', countryName: 'Philippines' },
  'Asia/Ho_Chi_Minh': { country: 'VN', countryName: 'Vietnam' },
  'Australia/Sydney': { country: 'AU', countryName: 'Australia' },
  'Australia/Melbourne': { country: 'AU', countryName: 'Australia' },
  'Australia/Brisbane': { country: 'AU', countryName: 'Australia' },
  'Australia/Perth': { country: 'AU', countryName: 'Australia' },
  'Pacific/Auckland': { country: 'NZ', countryName: 'New Zealand' },
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  JP: 'Japan',
  FR: 'France',
  NL: 'Netherlands',
  AE: 'United Arab Emirates',
  BR: 'Brazil',
  ID: 'Indonesia',
  LK: 'Sri Lanka',
  BD: 'Bangladesh',
  PK: 'Pakistan',
  NP: 'Nepal',
};

export function detectClientLocation(): GeoLocation {
  if (typeof window === 'undefined') {
    return { country: 'IN', countryName: 'India' };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }

    if (tz) {
      if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz === 'IST') {
        return { country: 'IN', countryName: 'India' };
      }
      if (tz.startsWith('Europe/')) {
        const city = tz.replace('Europe/', '').replace(/_/g, ' ');
        return { country: 'EU', countryName: city };
      }
      if (tz.startsWith('America/')) {
        return { country: 'US', countryName: 'United States' };
      }
      if (tz.startsWith('Asia/')) {
        return { country: 'AS', countryName: tz.replace('Asia/', '').replace(/_/g, ' ') };
      }
    }

    const lang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (lang && lang.includes('-')) {
      const code = lang.split('-')[1].toUpperCase();
      return {
        country: code,
        countryName: COUNTRY_NAMES[code] || code,
      };
    }
  } catch {
    // Non-blocking fallback
  }

  return { country: 'IN', countryName: 'India' };
}
