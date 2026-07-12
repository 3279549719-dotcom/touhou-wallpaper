/** Character list helpers (scheme A: sidebar + prev/next nav). */
export const SIDEBAR_LAYOUT = "split";

export function characterLabel(id: string, name: string): string {
  return `${id} ${name}`;
}

export function nextCharacterIndex(
  currentIndex: number,
  delta: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return (currentIndex + delta + total) % total;
}
