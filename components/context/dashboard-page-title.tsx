"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface PageTitleContextValue {
  title: String
  setTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({
  children,
  defaultTitle = "Dashboard",
}: {
  children: ReactNode,
  defaultTitle?: string
}) {
  const [title, setTitle] = useState(defaultTitle);

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);

  if (!context) {
    return {
      title: "Dashboard",
      setTitle: () => { },
    }
  }

  return context;
}