"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-2">OPPLUS</h1>
        <p className="text-lg text-slate-500 mb-16">
          Plataforma de Orquestación Inteligente
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <Link
          href="/supervisor"
          prefetch={true}
          className="group w-80 h-72 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-center items-center p-8 border border-slate-100"
        >
          <svg
            className="w-12 h-12 mb-6 text-slate-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.5h3.75v6.75H3v-6.75Zm6.75-6h3.75v12.75H9.75V7.5Zm6.75 3h3.75v9.75h-3.75V10.5Z"
            />
          </svg>
          <p className="text-2xl font-bold">Supervisor</p>
          <p className="text-slate-500 mt-2">Dashboard Analítico</p>
        </Link>

        <Link
          href="/gestor/25"
          prefetch={true}
          className="group w-80 h-72 bg-slate-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-center items-center p-8"
        >
          <svg
            className="w-12 h-12 mb-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <p className="text-2xl font-bold">Gestor</p>
          <p className="text-slate-400 mt-2">Entorno Operativo</p>
        </Link>
      </div>
    </div>
  );
}
