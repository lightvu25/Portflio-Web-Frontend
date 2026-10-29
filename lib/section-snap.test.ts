import { describe, expect, it } from "vitest";
import {
  buildSectionStop,
  hasMoreStopsBelow,
  normalizeSnapStops,
  resolveMagneticSnapTarget,
  resolveNextStopOnButtonClick,
  type SnapStop,
} from "./section-snap";

describe("section-snap", () => {
  const sampleStops: SnapStop[] = normalizeSnapStops([
    { id: "hero-greeting", topY: 0, bottomExitY: 0 },
    { id: "hero-stats", topY: 1850, bottomExitY: 1850 },
    { id: "hero-cta", topY: 3800, bottomExitY: 3800 },
    { id: "about", topY: 4600, bottomExitY: 4600 },
    { id: "services", topY: 5400, bottomExitY: 5400 },
    { id: "portfolio", topY: 6200, bottomExitY: 6200 },
    // Tall section with embedded feedback form (topY=6900, bottomExitY=7380)
    { id: "testimonials", topY: 6900, bottomExitY: 7380 },
    { id: "contact-cta", topY: 7850, bottomExitY: 7850 },
    { id: "footer", topY: 8300, bottomExitY: 8300 },
  ]);

  describe("buildSectionStop", () => {
    it("treats sections within desktop overflow allowance as single-screen stops", () => {
      const stop = buildSectionStop({
        id: "about",
        offsetTop: 4672,
        offsetHeight: 770, // 75px taller than 695px available height on 1366x768 laptop
        viewportHeight: 768,
        headerHeight: 73,
        maxScrollY: 8500,
      });

      expect(stop.topY).toBe(4599);
      expect(stop.bottomExitY).toBe(4599);
    });

    it("preserves internal scroll range for genuinely tall or form-bearing sections", () => {
      const stop = buildSectionStop({
        id: "testimonials",
        offsetTop: 6972,
        offsetHeight: 1180,
        viewportHeight: 800,
        headerHeight: 72,
        maxScrollY: 8500,
        preserveFullHeightScroll: true,
      });

      expect(stop.topY).toBe(6900);
      expect(stop.bottomExitY).toBe(7352);
      expect(stop.bottomExitY).toBeGreaterThan(stop.topY);
    });
  });

  describe("resolveNextStopOnButtonClick & hasMoreStopsBelow", () => {
    it("steps downward 1 section at a time across all 9 homepage stops", () => {
      expect(resolveNextStopOnButtonClick(sampleStops, 0)?.id).toBe(
        "hero-stats",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 1850)?.id).toBe(
        "hero-cta",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 3800)?.id).toBe("about");
      expect(resolveNextStopOnButtonClick(sampleStops, 4600)?.id).toBe(
        "services",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 5400)?.id).toBe(
        "portfolio",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 6200)?.id).toBe(
        "testimonials",
      );
      // Even halfway inside tall testimonials section, button jumps to next section
      expect(resolveNextStopOnButtonClick(sampleStops, 7100)?.id).toBe(
        "contact-cta",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 7850)?.id).toBe(
        "footer",
      );
      expect(resolveNextStopOnButtonClick(sampleStops, 8300)).toBeNull();
    });

    it("hides the downward button once at the final stop or document bottom", () => {
      expect(hasMoreStopsBelow(sampleStops, 0, 8300)).toBe(true);
      expect(hasMoreStopsBelow(sampleStops, 7850, 8300)).toBe(true);
      expect(hasMoreStopsBelow(sampleStops, 8290, 8300)).toBe(false);
      expect(hasMoreStopsBelow(sampleStops, 8300, 8300)).toBe(false);
    });
  });

  describe("resolveMagneticSnapTarget", () => {
    it("pulls forward to Hero Stage 2 on a slight downward scroll from top (never rubber-bands back to 0)", () => {
      expect(resolveMagneticSnapTarget(sampleStops, 0, 1)?.id).toBe(
        "hero-stats",
      );
      expect(resolveMagneticSnapTarget(sampleStops, 25, 1)?.id).toBe(
        "hero-stats",
      );
      expect(resolveMagneticSnapTarget(sampleStops, 1860, 1)?.id).toBe(
        "hero-cta",
      );
      expect(resolveMagneticSnapTarget(sampleStops, 3805, 1)?.id).toBe("about");
    });

    it("allows free scrolling inside the middle of a tall section, then snaps at its bottom edge", () => {
      // At top of tall testimonials (6900), scrolling down lets user read marquee & form
      expect(resolveMagneticSnapTarget(sampleStops, 6900, 1)).toBeNull();
      expect(resolveMagneticSnapTarget(sampleStops, 7150, 1)).toBeNull();

      // Near bottom edge of testimonials (7380 - 40 = 7340), scrolling down snaps to contact-cta
      expect(resolveMagneticSnapTarget(sampleStops, 7340, 1)?.id).toBe(
        "contact-cta",
      );
    });

    it("snaps cleanly upward between single-screen stops while respecting tall section interiors", () => {
      expect(resolveMagneticSnapTarget(sampleStops, 5400, -1)?.id).toBe(
        "about",
      );
      expect(resolveMagneticSnapTarget(sampleStops, 4600, -1)?.id).toBe(
        "hero-cta",
      );
      expect(resolveMagneticSnapTarget(sampleStops, 1850, -1)?.id).toBe(
        "hero-greeting",
      );

      // Inside lower half of tall testimonials (7250), scrolling up moves freely toward heading
      expect(resolveMagneticSnapTarget(sampleStops, 7250, -1)).toBeNull();
      // At top of testimonials (6900), scrolling up snaps to portfolio
      expect(resolveMagneticSnapTarget(sampleStops, 6900, -1)?.id).toBe(
        "portfolio",
      );
    });
  });
});
