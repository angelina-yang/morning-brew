/**
 * Coffee-themed copy bank for empty/error/loading states.
 *
 * Keeps Daily Brew's voice consistent and the app feeling alive.
 * Pick one at random per render with pickRandom().
 */

export const BREWING_MESSAGES = [
  "Your scouts are still brewing... ☕",
  "Grinding the beans, hang tight.",
  "Steeping a fresh batch for you.",
  "Pouring your morning brew — one sec.",
  "Almost ready. The beans are cooperating today.",
];

export const QUIET_DAY_MESSAGES = [
  "Quiet morning. Your scouts didn't find anything new today. ☕",
  "Nothing fresh this morning — maybe the internet slept in.",
  "No new grounds today. Sometimes that's a good thing.",
  "Your scouts came back empty. Try again later or add more topics.",
  "Slow news day. Nothing worth your coffee this morning.",
];

export const YUTORI_ERROR_MESSAGES = [
  "Hmm, grounds but no coffee. Yutori isn't responding — try again in a minute.",
  "Yutori's machine is on the fritz. Give it a moment and refresh.",
  "Your scouts are on a coffee break. Try again shortly.",
];

export const CLAUDE_ERROR_MESSAGES = [
  "Claude's barista skills are off today. Try again in a moment.",
  "The brew got interrupted mid-pour. One more try?",
  "Something went wrong brewing your digest. Give it another shot.",
];

export const RATE_LIMIT_MESSAGES = [
  "Easy, tiger — you're brewing too fast. Wait a minute and try again.",
  "The espresso machine needs a breather. Back in 60 seconds.",
];

/**
 * Pick a message from a bank. Uses a seed so the same render shows the same
 * message (prevents flicker on re-render). Default seed is the current hour,
 * so you'll see something different hour-to-hour.
 */
export function pickRandom(bank: readonly string[], seed: number = Math.floor(Date.now() / 3_600_000)): string {
  if (bank.length === 0) return "";
  const idx = Math.abs(seed) % bank.length;
  return bank[idx];
}
