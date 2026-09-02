/** English country names via the runtime locale data (ISO 3166-1 alpha-2). */

const FALLBACK_CODES = [
  'AF', 'AL', 'DZ', 'AD', 'AO', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BH', 'BD', 'BY',
  'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'KH',
  'CM', 'CA', 'CV', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CR', 'HR', 'CU', 'CY',
  'CZ', 'CD', 'DK', 'DJ', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET',
  'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GT', 'GN', 'GY', 'HT',
  'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'CI', 'JM', 'JP',
  'JO', 'KZ', 'KE', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LT', 'LU',
  'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MR', 'MX', 'MD', 'MN', 'ME', 'MA', 'MZ',
  'MM', 'NA', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'KP', 'MK', 'NO', 'OM', 'PK',
  'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RU', 'RW', 'SA', 'SN',
  'RS', 'SG', 'SK', 'SI', 'SO', 'ZA', 'KR', 'SS', 'ES', 'LK', 'SD', 'SE', 'CH',
  'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TN', 'TR', 'TM', 'UG', 'UA', 'AE',
  'GB', 'US', 'UY', 'UZ', 'VE', 'VN', 'YE', 'ZM', 'ZW',
]

function regionCodes(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('region').filter((code) =>
        /^[A-Z]{2}$/.test(code),
      )
    }
  } catch {
    /* ignore */
  }
  return FALLBACK_CODES
}

export function listCountryNames(): string[] {
  const display = new Intl.DisplayNames(['en'], { type: 'region' })
  const names = regionCodes()
    .map((code) => display.of(code))
    .filter((name): name is string => Boolean(name))
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en'))
}

/** Map a saved free-text location (e.g. "Ashgabat, Turkmenistan") to a country name. */
export function matchStoredCountry(
  stored: string | undefined,
  countries: string[],
): string {
  const raw = stored?.trim() ?? ''
  if (!raw) return ''
  const lower = raw.toLowerCase()
  const exact = countries.find((name) => name.toLowerCase() === lower)
  if (exact) return exact
  const contained = countries
    .filter((name) => lower.includes(name.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0]
  return contained ?? ''
}
