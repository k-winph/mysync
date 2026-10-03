// Maps the user's animation-speed setting to a duration in milliseconds.
// Used by the count-up money figures and the dashboard donut draw-in.
// 'off' = no animation (show the final value at once).
export const ANIM_DURATIONS = {
  off: 0,
  normal: 800,
  fast: 350,
}

export function animDuration(speed) {
  return ANIM_DURATIONS[speed] ?? ANIM_DURATIONS.fast
}
