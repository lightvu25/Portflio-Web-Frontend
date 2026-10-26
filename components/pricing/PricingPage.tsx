"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BookingSection } from "@/components/booking/BookingPage";
import { Reveal } from "@/components/shared/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";

/** Photographer-defined service constants — stable content, kept as page data. */
const SESSIONS = [
  { label: "Ca sáng", time: "07:00 – 11:30" },
  { label: "Ca chiều", time: "13:00 – 17:00" },
];

const BENEFITS = [
  "Súng bong bóng, hắt sáng",
  "Đèn (flash + giả nắng)",
  "Trả full file đã căn chỉnh cơ bản",
  "Hậu kì 10 ảnh chi tiết",
  "Staff đi kèm (có tính thêm phí)",
  "Hỗ trợ chụp film (nếu khách có máy sẵn)",
];

const SURCHARGES = [
  {
    title: "Chụp kéo dài đến 19:00",
    detail: "Phụ phí +300.000 VNĐ.",
  },
  {
    title: "Chụp ngoại tỉnh",
    detail: "Chỉ áp dụng cho gói Cả ngày.",
  },
  {
    title: "Chi phí di chuyển",
    detail:
      "Giá gói chưa bao gồm chi phí di chuyển. Phí di chuyển được ước tính theo địa điểm chụp thực tế và sẽ được xác nhận trước khi chốt lịch.",
  },
];

/** The three customer groups — keyed by PricingPackage.groupSize. */
const GROUPS = [
  { size: 1, num: "01", title: "Cá nhân", subtitle: "Chụp cho 1 người" },
  { size: 2, num: "02", title: "2 người", subtitle: "Chụp đôi / bạn thân" },
  { size: 3, num: "03", title: "3 người", subtitle: "Nhóm nhỏ 3 người" },
];

/** Pointer travel (px) before a press becomes a drag (so plain clicks still work). */
const DRAG_THRESHOLD_PX = 8;
/** Drag distance (px) in X or Y to trigger switching to the next/previous group. */
const SWIPE_THRESHOLD_PX = 44;

interface SavedRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Package cover → group's other covers → page photos → neutral surface. */
function packageImage(
  p: PricingPackage,
  groupCovers: Map<number, string>,
  fallback?: string,
) {
  return p.coverImageUrl ?? groupCovers.get(p.groupSize) ?? fallback ?? null;
}

function PricingPageContent({
  packages,
  deposit,
  photos = [],
  turnstileSiteKey,
}: {
  packages: PricingPackage[];
  deposit: number;
  photos?: Photo[];
  turnstileSiteKey?: string;
}) {
  const searchParams = useSearchParams();
  const queryPkgId = Number(searchParams.get("package"));

  // Null = 3-card Grid View; 1 | 2 | 3 = Zoomed View for that groupSize
  const [zoomedGroup, setZoomedGroup] = useState<number | null>(() => {
    if (queryPkgId) {
      const matched = packages.find((p) => p.id === queryPkgId);
      if (matched) return matched.groupSize;
    }
    return null;
  });

  const [selectedPkgId, setSelectedPkgId] = useState<number | undefined>(() => {
    if (queryPkgId && packages.some((p) => p.id === queryPkgId)) {
      return queryPkgId;
    }
    return packages[0]?.id;
  });

  const [dragging, setDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const gridViewRef = useRef<HTMLDivElement>(null);
  const zoomViewRef = useRef<HTMLDivElement>(null);
  const zoomImageWrapRef = useRef<HTMLDivElement>(null);
  const zoomImageInnerRef = useRef<HTMLDivElement>(null);
  const zoomRightColRef = useRef<HTMLDivElement>(null);
  const cellImgRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const cellInnerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /** Stores bounding box of the clicked grid cell for GridZoom FLIP transition. */
  const flipFromRectRef = useRef<SavedRect | null>(null);
  const transitionModeRef = useRef<"open" | "change" | "close" | null>(null);
  const isAnimatingRef = useRef(false);

  // Pointer drag state for switching between the 3 groups inside Zoomed View
  const pressedRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  /** Representative image per group: first package cover in that group, or distinct fallback photos. */
  const groupCovers = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of packages) {
      if (p.coverImageUrl && !map.has(p.groupSize)) {
        map.set(p.groupSize, p.coverImageUrl);
      }
    }
    GROUPS.forEach((g, idx) => {
      if (!map.has(g.size) && photos[idx]?.imageUrl) {
        map.set(g.size, photos[idx].imageUrl);
      }
    });
    return map;
  }, [packages, photos]);

  const fallbackImage = photos[0]?.imageUrl ?? null;

  const activeGroupObj = useMemo(
    () => GROUPS.find((g) => g.size === zoomedGroup) ?? GROUPS[0],
    [zoomedGroup],
  );

  const groupPackages = useMemo(
    () =>
      zoomedGroup !== null
        ? packages.filter((p) => p.groupSize === zoomedGroup)
        : [],
    [packages, zoomedGroup],
  );

  // Ensure selectedPkgId always belongs to the active zoomedGroup when zoomed
  const activePkgId = useMemo(() => {
    if (zoomedGroup === null) return selectedPkgId;
    if (
      selectedPkgId !== undefined &&
      groupPackages.some((p) => p.id === selectedPkgId)
    ) {
      return selectedPkgId;
    }
    return groupPackages[0]?.id ?? selectedPkgId;
  }, [zoomedGroup, selectedPkgId, groupPackages]);

  const activePkg = useMemo(
    () => packages.find((p) => p.id === activePkgId) ?? groupPackages[0],
    [packages, activePkgId, groupPackages],
  );

  // Open zoomed view automatically if navigated to /pricing#booking or /pricing?package=X
  useEffect(() => {
    const checkHashOrParam = () => {
      if (window.location.hash === "#booking") {
        setZoomedGroup((prev) => {
          if (prev !== null) return prev;
          if (queryPkgId) {
            const found = packages.find((p) => p.id === queryPkgId);
            if (found) return found.groupSize;
          }
          return 1;
        });
      }
    };
    checkHashOrParam();
    window.addEventListener("hashchange", checkHashOrParam);
    return () => window.removeEventListener("hashchange", checkHashOrParam);
  }, [packages, queryPkgId]);

  /**
   * GridZoom hover effect (from template/GridZoom-main/src/js/grid.js):
   * Outer cell scales down slightly (0.95) while inner image scales up (1.24) with expo ease.
   */
  const handleCellMouseEnter = useCallback((size: number) => {
    const outer = cellImgRefs.current[size];
    const inner = cellInnerRefs.current[size];
    if (!outer || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf([outer, inner]);
    gsap
      .timeline({ defaults: { duration: 1.6, ease: "expo.out" } })
      .to(outer, { scale: 0.96 }, 0)
      .to(inner, { scale: 1.22 }, 0);
  }, []);

  const handleCellMouseLeave = useCallback((size: number) => {
    const outer = cellImgRefs.current[size];
    const inner = cellInnerRefs.current[size];
    if (!outer || !inner) return;
    gsap.killTweensOf([outer, inner]);
    gsap
      .timeline({ defaults: { duration: 1.6, ease: "expo.out" } })
      .to([outer, inner], { scale: 1 }, 0);
  }, []);

  /**
   * Open Zoomed View from one of the 3 group cards (showContent in GridZoom-main).
   */
  const handleOpenGroup = useCallback(
    (size: number) => {
      if (isAnimatingRef.current) return;
      const clickedEl = cellImgRefs.current[size];
      if (clickedEl) {
        const rect = clickedEl.getBoundingClientRect();
        flipFromRectRef.current = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      } else {
        flipFromRectRef.current = null;
      }

      const firstInGroup = packages.find((p) => p.groupSize === size);
      if (firstInGroup) {
        setSelectedPkgId(firstInGroup.id);
      }

      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        transitionModeRef.current = null;
        setZoomedGroup(size);
        return;
      }

      // Animate out the other 2 cells briefly, then mount Zoomed View and FLIP-zoom the clicked image
      const otherCells = GROUPS.filter((g) => g.size !== size)
        .map((g) => cellImgRefs.current[g.size]?.parentElement)
        .filter((el): el is HTMLElement => Boolean(el));

      isAnimatingRef.current = true;
      transitionModeRef.current = "open";

      gsap.to(otherCells, {
        autoAlpha: 0,
        scale: 0.86,
        duration: 0.26,
        stagger: 0.04,
        ease: "expo.in",
        onComplete: () => {
          setZoomedGroup(size);
        },
      });
    },
    [packages],
  );

  /**
   * Switch to another group while already inside Zoomed View (changeContent in GridZoom-main).
   * Can be triggered by dragging/swiping (up/down/left/right) or clicking the Mini Grid / Prev-Next.
   */
  const handleSwitchGroupInZoom = useCallback(
    (nextSize: number) => {
      if (isAnimatingRef.current || nextSize === zoomedGroup) return;
      const firstInGroup = packages.find((p) => p.groupSize === nextSize);
      if (firstInGroup) {
        setSelectedPkgId(firstInGroup.id);
      }

      const wrap = zoomImageWrapRef.current;
      const rightCol = zoomRightColRef.current;
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!wrap || reduceMotion) {
        transitionModeRef.current = null;
        setZoomedGroup(nextSize);
        return;
      }

      isAnimatingRef.current = true;
      transitionModeRef.current = "change";

      const tl = gsap.timeline({
        defaults: { duration: 0.32, ease: "expo.in" },
        onComplete: () => {
          setZoomedGroup(nextSize);
        },
      });

      tl.to(wrap, { scale: 0.84, autoAlpha: 0, x: 0, y: 0 }, 0);
      if (rightCol) {
        tl.to(rightCol, { autoAlpha: 0, y: 18, duration: 0.26 }, 0);
      }
    },
    [packages, zoomedGroup],
  );

  /**
   * Close Zoomed View and return to the 3-card Grid View (closeContent in GridZoom-main).
   */
  const handleBackToGrid = useCallback(() => {
    if (zoomedGroup === null) return;
    if (typeof window !== "undefined" && window.location.hash === "#booking") {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }

    const zoomView = zoomViewRef.current;
    const wrap = zoomImageWrapRef.current;
    const rightCol = zoomRightColRef.current;
    gsap.killTweensOf([zoomView, wrap, rightCol].filter(Boolean));

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!zoomView || !wrap || reduceMotion) {
      isAnimatingRef.current = false;
      transitionModeRef.current = null;
      setZoomedGroup(null);
      return;
    }

    isAnimatingRef.current = true;
    gsap
      .timeline({
        defaults: { duration: 0.4, ease: "expo.inOut" },
        onComplete: () => {
          isAnimatingRef.current = false;
          transitionModeRef.current = "close";
          setZoomedGroup(null);
        },
      })
      .to(wrap, { scale: 0.88, autoAlpha: 0 }, 0)
      .to(zoomView, { autoAlpha: 0, y: 16, duration: 0.35 }, 0);
  }, [zoomedGroup]);

  // Run GridZoom entrance / changeContent / closeContent animations when zoomedGroup updates
  useGSAP(
    () => {
      if (zoomedGroup === null) {
        isAnimatingRef.current = false;
        const gridView = gridViewRef.current;
        if (!gridView) return;

        // Always ensure gridView container and inner image wrappers are completely visible & clean
        gsap.set(gridView, { clearProps: "all", autoAlpha: 1 });
        const imgBoxes = [
          ...Object.values(cellImgRefs.current),
          ...Object.values(cellInnerRefs.current),
        ].filter((el): el is HTMLDivElement => Boolean(el));
        if (imgBoxes.length > 0) {
          gsap.set(imgBoxes, { clearProps: "all" });
        }

        const cells = gsap.utils.toArray<HTMLElement>(
          "[data-grid-card]",
          gridView,
        );
        if (cells.length === 0) return;

        const mode = transitionModeRef.current;
        transitionModeRef.current = null;

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (mode !== "close" || reduceMotion) {
          gsap.set(cells, { clearProps: "all", autoAlpha: 1, scale: 1 });
          return;
        }

        gsap.fromTo(
          cells,
          { autoAlpha: 0, scale: 0.88 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.06,
            ease: "expo.out",
            clearProps: "all",
          },
        );
        return;
      }

      const wrap = zoomImageWrapRef.current;
      const inner = zoomImageInnerRef.current;
      const rightCol = zoomRightColRef.current;
      const zoomView = zoomViewRef.current;
      if (!wrap || !zoomView) {
        isAnimatingRef.current = false;
        return;
      }

      const mode = transitionModeRef.current;
      transitionModeRef.current = null;

      const ohInners = gsap.utils.toArray<HTMLElement>(
        ".oh__inner",
        zoomView,
      );
      const miniCells = gsap.utils.toArray<HTMLElement>(
        "[data-mini-cell]",
        zoomView,
      );
      const subCards = gsap.utils.toArray<HTMLElement>(
        "[data-sub-pkg]",
        zoomView,
      );

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          isAnimatingRef.current = false;
          gsap.set([wrap, rightCol, ...ohInners, ...subCards].filter(Boolean), {
            clearProps: "willChange",
          });
        },
      });

      if (mode === "open" && flipFromRectRef.current) {
        const from = flipFromRectRef.current;
        flipFromRectRef.current = null;
        const to = wrap.getBoundingClientRect();
        const dx =
          from.left + from.width / 2 - (to.left + to.width / 2);
        const dy =
          from.top + from.height / 2 - (to.top + to.height / 2);
        const sx = Math.max(0.25, from.width / Math.max(1, to.width));
        const sy = Math.max(0.25, from.height / Math.max(1, to.height));

        tl.fromTo(
          wrap,
          {
            x: dx,
            y: dy,
            scaleX: sx,
            scaleY: sy,
            autoAlpha: 1,
            zIndex: 30,
          },
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.95,
            ease: "expo.inOut",
            clearProps: "zIndex",
          },
          0,
        );

        if (inner) {
          tl.fromTo(
            inner,
            { scale: 1.22 },
            { scale: 1, duration: 0.95, ease: "expo.inOut" },
            0,
          );
        }
      } else {
        // changeContent or direct open
        tl.fromTo(
          wrap,
          { scale: 0.84, autoAlpha: 0, x: 0, y: 0 },
          { scale: 1, autoAlpha: 1, x: 0, y: 0, duration: 0.75, ease: "expo.out" },
          0,
        );
      }

      if (rightCol) {
        tl.fromTo(
          rightCol,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.65 },
          0.12,
        );
      }

      if (ohInners.length > 0) {
        tl.fromTo(
          ohInners,
          { yPercent: 105, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05 },
          0.16,
        );
      }

      if (subCards.length > 0) {
        tl.fromTo(
          subCards,
          { autoAlpha: 0, y: 18, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.07,
          },
          0.2,
        );
      }

      if (miniCells.length > 0 && mode === "open") {
        tl.fromTo(
          miniCells,
          { autoAlpha: 0, scale: 0.8 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.06,
          },
          0.25,
        );
      }
    },
    { scope: stageRef, dependencies: [zoomedGroup] },
  );

  // Pointer drag / swipe handlers on the zoomed showcase (supports both horizontal & vertical drag)
  const onZoomPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isAnimatingRef.current || zoomedGroup === null) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      // Ignore interactions inside form fields or explicit buttons/links
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, label, form, a, [data-zoom-back], [data-mini-cell]")) {
        return;
      }
      pressedRef.current = true;
      draggedRef.current = false;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
    },
    [zoomedGroup],
  );

  const onZoomPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pressedRef.current) return;
      const wrap = zoomImageWrapRef.current;
      if (!wrap) return;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      const dist = Math.hypot(dx, dy);

      if (!draggedRef.current) {
        if (dist < DRAG_THRESHOLD_PX) return;
        draggedRef.current = true;
        setDragging(true);
        try {
          wrap.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }

      gsap.set(wrap, {
        x: dx * 0.38,
        y: dy * 0.28,
        scale: gsap.utils.clamp(0.92, 1, 1 - dist / 900),
      });
    },
    [],
  );

  const onZoomPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pressedRef.current) return;
      pressedRef.current = false;
      const wrap = zoomImageWrapRef.current;
      if (wrap) {
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }

      if (!draggedRef.current || zoomedGroup === null) return;
      setDragging(false);
      draggedRef.current = false;

      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Drag left (dx < -SWIPE) or drag up (dy < -SWIPE) -> next group
      // Drag right (dx > SWIPE) or drag down (dy > SWIPE) -> prev group
      if (Math.max(absX, absY) >= SWIPE_THRESHOLD_PX) {
        const primaryDelta = absX >= absY ? dx : dy;
        const dir = primaryDelta < 0 ? 1 : -1;
        const currentIdx = GROUPS.findIndex((g) => g.size === zoomedGroup);
        const nextIdx = (currentIdx + dir + GROUPS.length) % GROUPS.length;
        handleSwitchGroupInZoom(GROUPS[nextIdx].size);
      } else if (wrap) {
        gsap.to(wrap, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "expo.out",
        });
      }
    },
    [zoomedGroup, handleSwitchGroupInZoom],
  );

  const fourSteps = [
    {
      num: "01",
      title: "Chọn gói chụp",
      detail: "Xem bộ sưu tập và bảng giá, chọn gói chụp hợp gu bạn thích.",
    },
    {
      num: "02",
      title: "Gửi thông tin",
      detail: "Chọn ngày chụp ở form đặt lịch, web tự soạn sẵn tin nhắn gửi Bấu.",
    },
    {
      num: "03",
      title: "Cọc giữ lịch",
      detail: `Bấu xác nhận lịch trống và gửi thông tin cọc ${formatVnd(deposit)} để giữ lịch.`,
    },
    {
      num: "04",
      title: "Chụp và nhận ảnh",
      detail: "Trao đổi thống nhất concept trước buổi chụp và nhận ảnh hậu kỳ sau 1 tuần.",
    },
  ];

  const zoomedImg =
    (zoomedGroup !== null ? groupCovers.get(zoomedGroup) : null) ??
    (activePkg
      ? packageImage(activePkg, groupCovers, fallbackImage ?? undefined)
      : fallbackImage);

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      {/* Page Header */}
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
          <Reveal from="up">
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Dịch vụ &amp; Đặt lịch
            </p>
            <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite md:text-6xl">
              Bảng giá chụp ảnh
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-grey-50">
              Gói chụp cho cá nhân và nhóm nhỏ. Đặt cọc {formatVnd(deposit)} để giữ lịch —
              phần còn lại thanh toán sau buổi chụp.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive GridZoom Section: 3 Group Cards <-> Zoomed Detail (2 Child Packages + Booking Form) */}
      <section
        ref={stageRef}
        aria-label="Chọn nhóm chụp và đặt lịch"
        className="border-b border-dark-12"
      >
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-14">
          {zoomedGroup === null ? (
            /* ---------------- STATE 1: 3-CARD GRID VIEW ---------------- */
            <div key="grid-view" ref={gridViewRef} data-grid-view="groups">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
                  Bạn chụp cho bao nhiêu người?
                </h2>
                <p className="text-xs text-grey-50">
                  Bấm vào 1 trong 3 gói để phóng to xem các gói con &amp; đặt lịch
                </p>
              </div>

              <div
                className="mt-6 grid gap-6 sm:grid-cols-3"
                role="group"
                aria-label="Nhóm khách hàng"
              >
                {GROUPS.map((g) => {
                  const count = packages.filter((p) => p.groupSize === g.size).length;
                  const img = groupCovers.get(g.size) ?? fallbackImage;
                  return (
                    <button
                      key={g.size}
                      type="button"
                      data-grid-card={g.size}
                      onClick={() => handleOpenGroup(g.size)}
                      onMouseEnter={() => handleCellMouseEnter(g.size)}
                      onMouseLeave={() => handleCellMouseLeave(g.size)}
                      className="group relative flex flex-col overflow-hidden rounded-[16px] bg-dark-08 text-left transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(107,142,90,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                    >
                      {/* .grid__cell-img outer frame */}
                      <div
                        ref={(el) => {
                          cellImgRefs.current[g.size] = el;
                        }}
                        className="grid__cell-img relative aspect-[16/10] w-full overflow-hidden rounded-t-[16px] bg-dark-12"
                      >
                        {/* .grid__cell-img-inner */}
                        <div
                          ref={(el) => {
                            cellInnerRefs.current[g.size] = el;
                          }}
                          className="grid__cell-img-inner relative h-full w-full"
                        >
                          {img && (
                            <Image
                              src={img}
                              alt={g.title}
                              fill
                              quality={100}
                              sizes="(min-width: 1280px) 480px, (min-width: 640px) 33vw, 100vw"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="pointer-events-none absolute left-3.5 top-3.5 rounded-full bg-black/55 px-3 py-1 font-mono text-xs font-bold tracking-wider text-white backdrop-blur-sm">
                          {g.num}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-5">
                        <div>
                          <p className="font-semibold text-lg font-semibold text-absolutewhite">
                            {g.title}
                          </p>
                          <p className="mt-0.5 text-xs text-grey-40">
                            {count > 0
                              ? `${count} gói — chụp cho ${g.size} người`
                              : "Chưa có gói"}
                          </p>
                        </div>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-55/15 text-sm font-semibold text-brand-55 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-brand-55 group-hover:text-white"
                        >
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ---------------- STATE 2: GRIDZOOM OPENED VIEW ---------------- */
            <div key="zoom-view" ref={zoomViewRef} data-zoom-view={zoomedGroup} className="space-y-8">
              {/* Top control bar: Back button (GridZoom .back) + Mini Grid switcher (.grid--mini) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
                <button
                  type="button"
                  onClick={handleBackToGrid}
                  data-zoom-back
                  className="back group inline-flex items-center gap-3 rounded-full bg-dark-08 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-absolutewhite transition-colors hover:bg-dark-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                >
                  <svg
                    viewBox="0 0 50 9"
                    width="34"
                    height="9"
                    aria-hidden="true"
                    className="stroke-current stroke-[1.6] transition-transform duration-200 group-hover:-translate-x-1"
                  >
                    <path
                      fill="none"
                      strokeLinecap="round"
                      d="M0 4.5l5-3M0 4.5l5 3M50 4.5H1"
                    />
                  </svg>
                  <span>Quay lại 3 gói</span>
                </button>

                {/* Mini Grid (.grid--mini from GridZoom-main) */}
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-grey-40 sm:inline">
                    Chuyển nhanh nhóm chụp:
                  </span>
                  <nav
                    aria-label="Chuyển nhóm chụp"
                    className="grid--mini flex items-center gap-2"
                  >
                    {GROUPS.map((g) => {
                      const thumb = groupCovers.get(g.size) ?? fallbackImage;
                      const isCurrent = g.size === zoomedGroup;
                      return (
                        <button
                          key={g.size}
                          type="button"
                          data-mini-cell={g.size}
                          onClick={() => handleSwitchGroupInZoom(g.size)}
                          aria-pressed={isCurrent}
                          className={`group relative flex items-center gap-2 overflow-hidden rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-all ${
                            isCurrent
                              ? "bg-brand-55/20 text-absolutewhite shadow-sm"
                              : "bg-dark-08 text-grey-50 hover:bg-dark-12 hover:text-absolutewhite"
                          }`}
                        >
                          <span className="relative h-6 w-8 shrink-0 overflow-hidden rounded-[5px] bg-dark-12">
                            {thumb && (
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                quality={100}
                                sizes="64px"
                                className={`object-cover transition-opacity ${
                                  isCurrent ? "opacity-45" : "opacity-90 group-hover:opacity-100"
                                }`}
                              />
                            )}
                          </span>
                          <span>{g.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Main 2-column GridZoom Stage (supports pointer drag anywhere outside the booking form) */}
              <div
                onPointerDown={onZoomPointerDown}
                onPointerMove={onZoomPointerMove}
                onPointerUp={onZoomPointerUp}
                onPointerCancel={onZoomPointerUp}
                className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
              >
                {/* Left Column: Zoomed Image Showcase (draggable up/down or left/right to switch group) */}
                <div className="lg:sticky lg:top-24 lg:col-span-5">
                  <div
                    ref={zoomImageWrapRef}
                    data-zoom-image
                    className={`relative overflow-hidden rounded-[18px] bg-dark-08 shadow-[0_20px_48px_rgba(0,0,0,0.12)] select-none touch-pan-y ${
                      dragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                  >
                    <div
                      ref={zoomImageInnerRef}
                      className="relative aspect-[4/5] w-full overflow-hidden bg-dark-12"
                    >
                      {zoomedImg && (
                        <Image
                          src={zoomedImg}
                          alt={activeGroupObj.title}
                          fill
                          quality={100}
                          draggable={false}
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className="object-cover"
                        />
                      )}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                      />

                      {/* Top drag hint pill */}
                      <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/95 backdrop-blur-md">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M18 8L22 12L18 16M6 8L2 12L6 16M12 2L16 6M12 2L8 6M12 22L16 18M12 22L8 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Kéo lên / sang ngang để đổi gói chụp
                        </span>
                        <span className="rounded-full bg-brand-55 px-3 py-1 font-mono text-xs font-bold text-white">
                          {activeGroupObj.num} / 03
                        </span>
                      </div>

                      {/* Bottom overlay with GridZoom .oh > .oh__inner text reveal */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <span className="oh block text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                          <span className="oh__inner inline-block">
                            Nhóm khách hàng · {activeGroupObj.subtitle}
                          </span>
                        </span>
                        <h2 className="oh mt-1 font-semibold text-3xl font-bold text-white md:text-4xl">
                          <span className="oh__inner inline-block">
                            Gói {activeGroupObj.title}
                          </span>
                        </h2>
                        <p className="oh mt-2 text-xs text-white/85">
                          <span className="oh__inner inline-block">
                            {groupPackages.length} gói con cho {activeGroupObj.size} người — chọn gói con bên phải và điền lịch chụp ngay bên dưới.
                          </span>
                        </p>

                        {/* Prev / Next quick buttons inside the zoomed card */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const idx = GROUPS.findIndex(
                                (g) => g.size === zoomedGroup,
                              );
                              const prev =
                                GROUPS[(idx - 1 + GROUPS.length) % GROUPS.length];
                              handleSwitchGroupInZoom(prev.size);
                            }}
                            aria-label="Nhóm gói trước"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = GROUPS.findIndex(
                                (g) => g.size === zoomedGroup,
                              );
                              const next = GROUPS[(idx + 1) % GROUPS.length];
                              handleSwitchGroupInZoom(next.size);
                            }}
                            aria-label="Nhóm gói tiếp theo"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/35"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: The 2 Sub-Packages of the Zoomed Group + Streamlined Booking Form */}
                <div ref={zoomRightColRef} className="space-y-8 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <p className="oh font-medium text-xs font-medium uppercase tracking-[0.14em] text-brand-55">
                          <span className="oh__inner inline-block">
                            Gói con thuộc nhóm {activeGroupObj.title}
                          </span>
                        </p>
                        <h3 className="oh mt-1 font-semibold text-2xl font-semibold text-absolutewhite md:text-3xl">
                          <span className="oh__inner inline-block">
                            Chọn 1 trong {groupPackages.length || 2} gói{" "}
                            {activeGroupObj.title.toLowerCase()}
                          </span>
                        </h3>
                      </div>
                      <span className="text-xs text-grey-50">
                        Bấm chọn gói con để đặt lịch bên dưới
                      </span>
                    </div>

                    {groupPackages.length > 0 ? (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {groupPackages.map((p) => {
                          const isSelected = activePkgId === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              data-sub-pkg={p.id}
                              onClick={() => setSelectedPkgId(p.id)}
                              aria-pressed={isSelected}
                              className={`group relative flex flex-col justify-between rounded-[16px] p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${
                                isSelected
                                  ? "bg-brand-55/15 shadow-[0_12px_28px_rgba(107,142,90,0.12)]"
                                  : "bg-dark-08 hover:bg-dark-12"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center rounded-full bg-brand-55/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-55">
                                    {sessionTypeLabel[p.sessionType]}
                                  </span>
                                  <span
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                      isSelected
                                        ? "bg-brand-55 text-white"
                                        : "bg-dark-06 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                </div>

                                <h4 className="mt-3 font-semibold text-xl font-semibold text-absolutewhite">
                                  {p.name}
                                </h4>
                                <p className="mt-1.5 font-semibold text-2xl font-bold text-brand-55">
                                  {formatVnd(p.price)}
                                </p>
                                <p className="mt-0.5 text-xs text-grey-40">
                                  Dành cho {p.groupSize} người
                                </p>
                                {p.description && (
                                  <p className="mt-3 text-sm leading-6 text-grey-50">
                                    {p.description}
                                  </p>
                                )}
                              </div>

                              <div className="mt-5 pt-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    isSelected
                                      ? "text-brand-55"
                                      : "text-grey-50 group-hover:text-absolutewhite"
                                  }`}
                                >
                                  {isSelected
                                    ? "Đang chọn gói này để đặt lịch"
                                    : "Bấm để chọn gói này →"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-[14px] bg-dark-08 p-6 text-sm text-grey-40">
                        Chưa có gói con nào cho nhóm này.
                      </p>
                    )}
                  </div>

                  {/* Integrated Booking Form inside Zoomed View (Package selector omitted) */}
                  <BookingSection
                    packages={packages}
                    turnstileSiteKey={turnstileSiteKey}
                    selectedPackageId={activePkgId}
                    onSelectPackageId={(id) => setSelectedPkgId(id)}
                    hidePackageSelector
                    embeddedInZoom
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- STATIC SERVICE INFO (IMAGE 3 — ALWAYS PRESERVED BELOW) ---------------- */}
      <section aria-label="Thông tin chi tiết dịch vụ và quy trình đặt lịch" className="pt-12">
        {/* 1. Session times */}
        <div className="mx-auto max-w-[1400px] px-5 pb-12 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Thời gian nhận ca
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SESSIONS.map((s) => (
              <div key={s.label} className="rounded-[14px] bg-dark-08 p-6">
                <p className="text-sm text-grey-50">{s.label}</p>
                <p className="mt-1 font-semibold text-2xl font-semibold text-absolutewhite">
                  {s.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Service benefits (Updated 6 items) */}
        <div className="mx-auto max-w-[1400px] px-5 pb-12 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Quyền lợi dịch vụ
          </h2>
          <div className="mt-4 grid gap-3 rounded-[14px] bg-dark-08 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <p key={b} className="flex items-start gap-2.5 text-sm text-grey-70">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-brand-55"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {b}
              </p>
            ))}
          </div>
        </div>

        {/* 3. Surcharges & conditions */}
        <div className="mx-auto max-w-[1400px] px-5 pb-14 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Phụ phí &amp; Lưu ý
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {SURCHARGES.map((item) => (
              <div key={item.title} className="rounded-[14px] bg-dark-08 p-5">
                <p className="font-semibold text-sm font-semibold text-absolutewhite">
                  {item.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-grey-70">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 4-step Booking Process with 4 large display numbers */}
        <div className="mx-auto max-w-[1400px] px-5 pb-16 md:px-10">
          <Reveal from="up">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-brand-55">
                  Quy trình đặt lịch
                </p>
                <h2 className="mt-2 font-semibold text-3xl font-semibold text-absolutewhite md:text-4xl">
                  Giữ lịch trong 4 bước
                </h2>
                <p className="mt-1.5 text-sm text-grey-50">
                  Giữ lịch chụp với Bấu trong 4 bước gọn gàng.
                </p>
              </div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-55/10 px-4 py-2 text-xs font-medium text-absolutewhite">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-55" />
                Hạn giao ảnh: sau 1 tuần kể từ khi khách chọn ảnh.
              </p>
            </div>

            <div className="relative mt-8">
              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {fourSteps.map((step) => (
                  <li
                    key={step.num}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] bg-dark-08 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(107,142,90,0.12)]"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-5xl font-bold leading-none tracking-tight tabular-nums text-brand-55 md:text-6xl">
                          {step.num}
                        </span>
                      </div>
                      <h3 className="mt-5 font-semibold text-lg font-semibold text-absolutewhite">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-grey-70">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export function PricingPage(props: {
  packages: PricingPackage[];
  deposit: number;
  photos?: Photo[];
  turnstileSiteKey?: string;
}) {
  return (
    <Suspense>
      <PricingPageContent {...props} />
    </Suspense>
  );
}
