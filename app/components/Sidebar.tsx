"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NUM_GESTORES = 39;
const GESTOR_IDS = Array.from({ length: NUM_GESTORES }, (_, i) => i + 1);

export default function Sidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [isGestoresOpen, setIsGestoresOpen] = useState(false);

  if (pathname === "/") return null;

  const filteredGestorIds = GESTOR_IDS.filter((id) =>
    `Gestor ${id}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <aside className="flex w-full md:h-screen md:w-72 flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-white flex-shrink-0">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
          OPPLUS
        </h1>
      </div>

      <div className="px-6">
        <Link
          href="/supervisor"
          className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            pathname === "/supervisor"
              ? "bg-[#0a0a0a] text-white"
              : "text-[#0a0a0a] hover:bg-gray-100"
          }`}
        >
          Panel de Dirección
        </Link>

        <Link
          href="/gestor/25"
          className={`mt-1 block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            pathname === "/gestor/25"
              ? "bg-[#0a0a0a] text-white"
              : "text-[#0a0a0a] hover:bg-gray-100"
          }`}
        >
          Escritorio Gestor
        </Link>

        <div className="my-3 border-t border-gray-200" />

        <button
          type="button"
          onClick={() => setIsGestoresOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-[#737373] transition-colors hover:text-[#0a0a0a]"
        >
          Equipo de Gestores
          <span className="text-xs">{isGestoresOpen ? "▼" : "▶"}</span>
        </button>

        {isGestoresOpen && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gestor..."
            className="mt-3 w-full border border-gray-200 px-3 py-2 text-sm text-[#0a0a0a] focus:border-[#0a0a0a] focus:outline-none"
          />
        )}
      </div>

      <nav className="my-2 max-h-64 overflow-y-auto px-6 md:max-h-none md:flex-1">
        {isGestoresOpen && (
          <ul className="flex flex-col gap-1 pl-4">
            {filteredGestorIds.map((id) => {
              const href = `/gestor/${id}`;
              const isActive = pathname === href;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "font-semibold text-[#0a0a0a]"
                        : "text-[#737373]"
                    }`}
                  >
                    Gestor {id}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="px-6 pb-6">
        <Link
          href="/"
          className="mb-3 block text-xs text-[#a3a3a3] transition-colors hover:text-[#737373]"
        >
          ← Volver al Login
        </Link>

        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-xs text-[#737373]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-500" />
          </span>
          Motor Cognitivo: Online
        </div>
      </div>
    </aside>
  );
}
