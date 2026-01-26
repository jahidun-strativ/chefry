import type { FC, PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "expo-router";

export interface ScrollProviderValue {
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
}

const ScrollContext = createContext<ScrollProviderValue | null>(null);

const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};

const ScrollProvider: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(false);
  }, [pathname]);

  return (
    <ScrollContext.Provider
      value={{
        isScrolled,
        setIsScrolled,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

export { ScrollContext, ScrollProvider, useScroll };
