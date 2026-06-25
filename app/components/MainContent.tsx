"use client";

import { usePathname } from "next/navigation";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/";

  return (
    <main
      className={`flex-1 overflow-y-auto ${isLogin ? "" : "p-8"}`}
    >
      {children}
    </main>
  );
}
