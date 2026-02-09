import { BREAKPOINTS } from "@/hooks/useResponsive";

/**
 * Get responsive value based on device type
 * @param mobile - Value for mobile devices (< 768px)
 * @param tablet - Optional value for tablet devices (768px - 1024px), defaults to mobile
 * @param desktop - Optional value for desktop devices (> 1024px), defaults to tablet or mobile
 */
export function getResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T,
): (width: number) => T {
  return (width: number) => {
    if (width < BREAKPOINTS.tabletMin) {
      return mobile;
    } else if (width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax) {
      return tablet ?? mobile;
    } else {
      return desktop ?? tablet ?? mobile;
    }
  };
}

/**
 * Scale a number by device type
 * @param base - Base value
 * @param mobileScale - Scale factor for mobile (default: 1)
 * @param tabletScale - Scale factor for tablet (default: 1.15)
 * @param desktopScale - Scale factor for desktop (default: 1.3)
 */
export function scaleByDevice(
  base: number,
  mobileScale = 1,
  tabletScale = 1.15,
  desktopScale = 1.3,
): (width: number) => number {
  return (width: number) => {
    if (width < BREAKPOINTS.tabletMin) {
      return base * mobileScale;
    } else if (width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax) {
      return base * tabletScale;
    } else {
      return base * desktopScale;
    }
  };
}

/**
 * Get responsive padding class based on device type
 */
export function getResponsivePadding(width: number): string {
  if (width < BREAKPOINTS.tabletMin) {
    return "px-4";
  } else if (width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax) {
    return "px-6 md:px-8";
  } else {
    return "px-8 lg:px-12";
  }
}

/**
 * Get responsive spacing class
 */
export function getResponsiveSpacing(base: string, width: number): string {
  if (width < BREAKPOINTS.tabletMin) {
    return base;
  } else if (width >= BREAKPOINTS.tabletMin && width <= BREAKPOINTS.tabletMax) {
    // Scale up spacing for tablet
    const spacingMap: Record<string, string> = {
      "p-2": "p-3",
      "p-4": "p-6",
      "p-6": "p-8",
      "px-2": "px-4",
      "px-4": "px-6",
      "px-6": "px-8",
      "py-2": "py-3",
      "py-4": "py-6",
      "mb-2": "mb-3",
      "mb-4": "mb-6",
      "mt-2": "mt-3",
      "mt-4": "mt-6",
    };
    return spacingMap[base] || base;
  } else {
    // Scale up more for desktop
    const spacingMap: Record<string, string> = {
      "p-2": "p-4",
      "p-4": "p-8",
      "p-6": "p-12",
      "px-2": "px-6",
      "px-4": "px-8",
      "px-6": "px-12",
      "py-2": "py-4",
      "py-4": "py-8",
      "mb-2": "mb-4",
      "mb-4": "mb-8",
      "mt-2": "mt-4",
      "mt-4": "mt-8",
    };
    return spacingMap[base] || base;
  }
}
