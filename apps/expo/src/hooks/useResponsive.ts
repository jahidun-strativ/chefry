import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  desktopMin: 1024,
} as const;

export interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  scaleSize: (base: number, mobileScale?: number, tabletScale?: number, desktopScale?: number) => number;
  scaleFont: (base: number) => number;
  scaleSpacing: (base: number) => number;
  breakpoints: typeof BREAKPOINTS;
}

/**
 * Hook for responsive design utilities
 * Provides device type flags and scaling functions based on screen width
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 */
export const useResponsive = (): ResponsiveValues => {
  const { width, height } = useWindowDimensions();

  const deviceType = useMemo(() => {
    if (width < BREAKPOINTS.tabletMin) {
      return "mobile" as const;
    } else if (width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax) {
      return "tablet" as const;
    } else {
      return "desktop" as const;
    }
  }, [width]);

  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isDesktop = deviceType === "desktop";

  const scaleSize = useMemo(
    () => (base: number, mobileScale = 1, tabletScale = 1.15, desktopScale = 1.3) => {
      if (isMobile) return base * mobileScale;
      if (isTablet) return base * tabletScale;
      return base * desktopScale;
    },
    [isMobile, isTablet],
  );

  const scaleFont = useMemo(
    () => (base: number) => {
      if (isMobile) return base;
      if (isTablet) return base * 1.1;
      return base * 1.2;
    },
    [isMobile, isTablet],
  );

  const scaleSpacing = useMemo(
    () => (base: number) => {
      if (isMobile) return base;
      if (isTablet) return base * 1.25;
      return base * 1.5;
    },
    [isMobile, isTablet],
  );

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height,
    scaleSize,
    scaleFont,
    scaleSpacing,
    breakpoints: BREAKPOINTS,
  };
};
