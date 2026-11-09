// Seasonal background effect selection. Pure so the month→effect mapping can be
// unit-tested. The visual particle types live in components/SeasonalEffect.
export const SEASON_TYPES = ['snow', 'leaves', 'sakura', 'rain', 'sparkle', 'hearts']

// Month → effect, tuned a little for Thailand (a long rainy season Jun–Oct).
export function autoSeasonType(date = new Date()) {
  const m = date.getMonth() + 1 // 1..12
  if (m === 12 || m === 1) return 'snow' // cool season / new year
  if (m === 2) return 'hearts' // Valentine's
  if (m === 3 || m === 4) return 'sakura' // blossoms / Songkran
  if (m === 5) return 'sparkle'
  if (m >= 6 && m <= 10) return 'rain' // Thai rainy season
  return 'leaves' // November
}

// Resolve the user's setting to an actual effect type (or null = none).
// setting: 'off' | 'auto' | one of SEASON_TYPES.
export function resolveSeasonType(setting, date = new Date()) {
  if (!setting || setting === 'off') return null
  if (setting === 'auto') return autoSeasonType(date)
  return SEASON_TYPES.includes(setting) ? setting : null
}
