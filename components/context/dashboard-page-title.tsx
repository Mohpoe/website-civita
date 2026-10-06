"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface PageTitleContextValue {
  title: string
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
    throw new Error("usePageTitle harus digunakan dalam PageTitleProvider");
  }

  return context;
}

export function PageTitle({ title }: { title: string }) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title)
  }, [setTitle]);

  return null;
}