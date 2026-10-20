import type Lenis from "lenis";

/** The app's single Lenis instance, set by SmoothScroll (null with reduced motion). */
export const smooth: { lenis: Lenis | null } = { lenis: null };
