"use client";

import { useCallback, useEffect, useState } from "react";
import { CameraIntro } from "@/components/home/CameraIntro";
import { StickyGridSection } from "@/components/home/StickyGridSection";
import type { ResolvedSiteStats } from "@/lib/site-stats";
import type { Photo } from "@/types/photo";

/** Maximum time (ms) to hold the loading screen if a CDN image hangs indefinitely. */
const HERO_IMAGES_FAILSAFE_MS = 7000;

export interface HeroImageProgress {
  loaded: number;
  total: number;
  ready: boolean;
}

/**
 * Coordinates the homepage loading gate (`CameraIntro`) with the actual download
 * and GPU-decode completion of all scroll-driven hero images in `StickyGridSection`.
 */
export function HomeHeroStage({
  photos,
  photographerName,
  stats,
}: {
  photos: Photo[];
  photographerName?: string | null;
  stats: ResolvedSiteStats;
}) {
  const [progress, setProgress] = useState<HeroImageProgress>(() => ({
    loaded: 0,
    total: photos.length > 0 ? Math.max(12, photos.length) : 0,
    ready: photos.length === 0,
  }));
  const [timedOut, setTimedOut] = useState(false);

  const handleProgress = useCallback((next: HeroImageProgress) => {
    setProgress((prev) => {
      if (
        prev.loaded === next.loaded &&
        prev.total === next.total &&
        prev.ready === next.ready
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const isHeroReady = progress.ready || timedOut;

  // Fail-safe timer so a stalled third-party/CDN image request never blocks the homepage forever.
  useEffect(() => {
    if (isHeroReady) return;
    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, HERO_IMAGES_FAILSAFE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isHeroReady]);

  return (
    <>
      <CameraIntro
        ready={isHeroReady}
        loadedCount={progress.loaded}
        totalCount={progress.total}
      />
      <StickyGridSection
        photos={photos}
        photographerName={photographerName}
        stats={stats}
        isReady={isHeroReady}
        onLoadProgress={handleProgress}
      />
    </>
  );
}
