import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

export const metadata: Metadata = {
  title: "MVP GYAR - Orquestación Inteligente",
  description: "Plataforma de gestión de cobranza MVP GYAR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="text-[#0a0a0a]">
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-slate-50">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
      </body>
    </html>
  );
}
