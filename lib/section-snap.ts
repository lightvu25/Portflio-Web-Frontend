/**
 * Pure math & target resolution for the Homepage Downward Button and
 * Magnetic Section Snap controller (`HomeSectionSnap`).
 */

export interface SnapStop {
  id: string;
  /** ScrollY where this stage/section aligns cleanly under the sticky header. */
  topY: number;
  /**
   * Maximum ScrollY still considered inside this section before snapping down
   * to the next section. Equals `topY` for Hero stages and single-screen sections;
   * exceeds `topY` for genuinely tall multi-screen sections (e.g. mobile stacked
   * layouts or Feedback marquee + form) so content inside is never skipped.
   */
  bottomExitY: number;
}

export interface BuildSectionStopOptions {
  id: string;
  offsetTop: number;
  offsetHeight: number;
  viewportHeight: number;
  headerHeight: number;
  maxScrollY: number;
  /**
   * Extra height tolerance (px) above the available viewport before a section
   * is treated as multi-screen. Keeps standard desktop sections snapping 1-to-1
   * even on compact 1366x768 laptop displays.
   */
  singleScreenOverflowAllowancePx?: number;
  /** Force internal free-scroll when true (e.g. sections containing interactive forms). */
  preserveFullHeightScroll?: boolean;
}

/**
 * Computes a `SnapStop` for a DOM section element.
 */
export function buildSectionStop({
  id,
  offsetTop,
  offsetHeight,
  viewportHeight,
  headerHeight,
  maxScrollY,
  singleScreenOverflowAllowancePx = 220,
  preserveFullHeightScroll = false,
}: BuildSectionStopOptions): SnapStop {
  const safeMaxY = Math.max(0, Math.round(maxScrollY));
  const availableH = Math.max(240, viewportHeight - headerHeight);
  const rawTop = Math.max(0, Math.round(offsetTop - headerHeight));
  const topY = Math.min(rawTop, safeMaxY);

  const excess = offsetHeight - availableH;
  const allowance = preserveFullHeightScroll ? 24 : singleScreenOverflowAllowancePx;

  if (excess <= allowance) {
    return { id, topY, bottomExitY: topY };
  }

  const rawBottomExit = Math.max(
    topY,
    Math.round(offsetTop + offsetHeight - viewportHeight),
  );
  const bottomExitY = Math.min(rawBottomExit, safeMaxY);
  return { id, topY, bottomExitY };
}

/**
 * Deduplicates and sorts stops monotonically by `topY`.
 */
export function normalizeSnapStops(stops: readonly SnapStop[]): SnapStop[] {
  const sorted = [...stops].sort((a, b) => a.topY - b.topY);
  const result: SnapStop[] = [];
  for (const stop of sorted) {
    const prev = result[result.length - 1];
    if (prev && Math.abs(stop.topY - prev.topY) < 16) {
      continue;
    }
    result.push({
      id: stop.id,
      topY: Math.max(0, Math.round(stop.topY)),
      bottomExitY: Math.max(
        Math.round(stop.topY),
        Math.round(stop.bottomExitY),
      ),
    });
  }
  return result;
}

/**
 * Resolves the immediate next `SnapStop` when the user clicks the floating
 * Downward Scroll Button (`↓`). Always advances 1 logical section/stage.
 */
export function resolveNextStopOnButtonClick(
  stops: readonly SnapStop[],
  currentScrollY: number,
  tolerancePx = 20,
): SnapStop | null {
  if (stops.length === 0) return null;
  const thresholdY = currentScrollY + tolerancePx;
  for (const stop of stops) {
    if (stop.topY > thresholdY) {
      return stop;
    }
  }
  return null;
}

/**
 * Returns true while there is still at least one section below the current scroll
 * position (and the viewport hasn't reached the bottom of the document).
 */
export function hasMoreStopsBelow(
  stops: readonly SnapStop[],
  currentScrollY: number,
  maxScrollY: number,
  tolerancePx = 24,
): boolean {
  if (maxScrollY <= tolerancePx) return false;
  if (currentScrollY >= maxScrollY - tolerancePx) return false;
  return resolveNextStopOnButtonClick(stops, currentScrollY, tolerancePx) !== null;
}

/**
 * Resolves the magnetic snap target when the user performs a slight downward (`1`)
 * or upward (`-1`) wheel/touch/scroll gesture.
 *
 * Returns `null` when inside the middle of a tall multi-screen section so the user
 * can freely read or interact with forms until reaching that section's top/bottom edge.
 */
export function resolveMagneticSnapTarget(
  stops: readonly SnapStop[],
  currentScrollY: number,
  direction: 1 | -1,
  edgeZonePx = 56,
): SnapStop | null {
  if (stops.length === 0) return null;
  const y = Math.max(0, currentScrollY);

  // Locate the latest stop whose `topY` is at or above `y` (within a small tolerance).
  let currentIdx = 0;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].topY <= y + 14) {
      currentIdx = i;
    } else {
      break;
    }
  }

  const current = stops[currentIdx];
  const isTallSection = current.bottomExitY > current.topY + 28;

  if (direction === 1) {
    // If inside a tall section and haven't reached its bottom edge yet, let native scroll proceed.
    if (isTallSection && y < current.bottomExitY - edgeZonePx) {
      return null;
    }
    const next = stops[currentIdx + 1];
    if (!next || next.topY <= y + 8) return null;
    return next;
  }

  // Scrolling UP (direction === -1)
  if (y <= 4) return null;

  // If inside a tall section and below its top edge, let native upward scroll proceed freely.
  if (
    isTallSection &&
    y > current.topY + edgeZonePx &&
    y <= current.bottomExitY + edgeZonePx
  ) {
    return null;
  }

  // If positioned materially below `current.topY` (e.g. between two hero stages or in transition gap),
  // snap cleanly back to `current.topY`.
  if (!isTallSection && y > current.topY + 28) {
    return current;
  }

  const prev = stops[currentIdx - 1];
  if (!prev) {
    return y > 8 ? stops[0] : null;
  }
  return prev;
}
