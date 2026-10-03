// Tracks whether the dashboard "intro" animation (balances counting up, donut
// drawing in) has already played this app session. It lives in memory, so it
// resets on a full app launch/reload — the intro plays once per open, then
// navigating back to the dashboard shows the final values at once.
let introPlayed = false

export function introShouldPlay() {
  return !introPlayed
}

export function markIntroPlayed() {
  introPlayed = true
}
