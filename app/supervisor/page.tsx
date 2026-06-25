"use client";

import { useMemo, useState } from "react";

interface GestorSla {
  id: number;
  assigned: number;
  managed: number;
}

interface DonutSegment {
  label: string;
  pct: number;
  className: string;
  dotClassName: string;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type Tier = "low" | "medium" | "high";

const TIER_RATIO_RANGES: Record<Tier, [number, number]> = {
  low: [0.05, 0.4],
  medium: [0.6, 0.8],
  high: [0.85, 0.99],
};

function buildTierAssignment(total: number): Tier[] {
  const lowCount = Math.round(total * 0.15);
  const mediumCount = Math.round(total * 0.3);
  const highCount = total - lowCount - mediumCount;

  const tiers: Tier[] = [
    ...Array<Tier>(lowCount).fill("low"),
    ...Array<Tier>(mediumCount).fill("medium"),
    ...Array<Tier>(highCount).fill("high"),
  ];

  for (let i = tiers.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(i * 13 + 7) * (i + 1));
    [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
  }

  return tiers;
}

function buildMockGestores(): GestorSla[] {
  const total = 39;
  const tiers = buildTierAssignment(total);

  return Array.from({ length: total }, (_, i) => {
    const id = i + 1;
    const assigned = 140 + Math.floor(pseudoRandom(id) * 21);
    const [minRatio, maxRatio] = TIER_RATIO_RANGES[tiers[i]];
    const minManaged = Math.floor(assigned * minRatio);
    const maxManaged = Math.floor(assigned * maxRatio);
    const managed =
      minManaged +
      Math.floor(pseudoRandom(id * 7) * (maxManaged - minManaged + 1));
    return { id, assigned, managed };
  });
}

const DONUT_RADIUS = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function withOffsets(segments: DonutSegment[]) {
  let offset = 0;
  return segments.map((segment) => {
    const length = (segment.pct / 100) * DONUT_CIRCUMFERENCE;
    const withOffset = { ...segment, length, offset };
    offset += length;
    return withOffset;
  });
}

function Donut({ title, segments }: { title: string; segments: DonutSegment[] }) {
  const segmentsWithOffsets = useMemo(() => withOffsets(segments), [segments]);

  return (
    <div>
      <h2 className="text-sm font-semibold tracking-tight text-[#0a0a0a]">
        {title}
      </h2>

      <div className="mt-6 flex flex-col items-center">
        <svg viewBox="0 0 180 180" className="h-40 w-40 -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={DONUT_RADIUS}
            fill="none"
            strokeWidth="20"
            className="stroke-gray-100"
          />
          {segmentsWithOffsets.map((segment) => (
            <circle
              key={segment.label}
              cx="90"
              cy="90"
              r={DONUT_RADIUS}
              fill="none"
              strokeWidth="20"
              strokeDasharray={`${segment.length} ${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
              className={segment.className}
            />
          ))}
        </svg>

        <ul className="mt-6 w-full space-y-2">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-2 text-[#737373]">
                <span className={`h-3 w-3 rounded-full ${segment.dotClassName}`} />
                {segment.label}
              </span>
              <span className="font-mono font-medium text-[#0a0a0a]">
                {segment.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SupervisorPage() {
  const gestores = useMemo(() => buildMockGestores(), []);
  const [selectedGestor, setSelectedGestor] = useState<GestorSla | null>(null);

  const totalAsignados = useMemo(
    () => gestores.reduce((sum, g) => sum + g.assigned, 0),
    [gestores]
  );
  const backlogRestante = 12000 - totalAsignados;
  const maxRatio = useMemo(
    () => Math.max(...gestores.map((g) => (g.managed / g.assigned) * 100)),
    [gestores]
  );

  const cumplimientoSegments = useMemo<DonutSegment[]>(() => {
    const total = gestores.length;
    const highCount = gestores.filter((g) => g.managed / g.assigned >= 0.85).length;
    const mediumCount = gestores.filter((g) => {
      const rate = g.managed / g.assigned;
      return rate >= 0.6 && rate < 0.85;
    }).length;
    const lowCount = total - highCount - mediumCount;

    return [
      {
        label: "Alto Rendimiento",
        pct: Math.round((highCount / total) * 100),
        className: "stroke-emerald-800",
        dotClassName: "bg-emerald-800",
      },
      {
        label: "Rendimiento Medio",
        pct: Math.round((mediumCount / total) * 100),
        className: "stroke-amber-500",
        dotClassName: "bg-amber-500",
      },
      {
        label: "Bajo Rendimiento",
        pct: Math.round((lowCount / total) * 100),
        className: "stroke-rose-600",
        dotClassName: "bg-rose-600",
      },
    ];
  }, [gestores]);

  const expedientes = useMemo(() => {
    if (!selectedGestor) return [];
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `EXP-${selectedGestor.id}00${i}`,
      importe: (Math.random() * 5000 + 1000).toFixed(2),
      score: "A-",
    }));
  }, [selectedGestor]);

  return (
    <div className="relative flex flex-1 flex-col bg-white px-8 py-12">
      <header className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
          Panel de Mando
        </h1>
        <p className="mt-1 text-sm text-[#737373]">
          Visión global de la operación GYAR.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        {/* Columna izquierda: KPIs */}
        <section className="xl:col-span-2 flex flex-col gap-10">
          <div>
            <p className="text-sm text-[#737373]">Total Asignados</p>
            <p className="mt-2 text-5xl font-light tracking-tight text-[#0a0a0a]">
              {totalAsignados.toLocaleString("es-ES")}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#737373]">Backlog Restante</p>
            <p className="mt-2 text-5xl font-light tracking-tight text-[#0a0a0a]">
              {backlogRestante.toLocaleString("es-ES")}
            </p>
          </div>
        </section>

        {/* Columna central: barras verticales */}
        <section className="xl:col-span-8">
          <h2 className="text-sm font-semibold tracking-tight text-[#0a0a0a]">
            Rendimiento por Gestor (Top 39)
          </h2>
          <p className="mt-1 text-xs text-[#737373]">
            % de cumplimiento de cada gestor frente al objetivo diario.
          </p>

          <div className="mt-6 flex items-end justify-between h-64 border-b border-slate-200 pb-2 gap-1 w-full relative">
            {gestores.map((gestor, index) => {
              const ratio = (gestor.managed / gestor.assigned) * 100;
              const rate = gestor.managed / gestor.assigned;
              const heightPct = Math.max((ratio / 100) * 100, 4);
              const barColor =
                rate >= 0.85
                  ? "bg-emerald-800"
                  : rate >= 0.6
                  ? "bg-amber-500"
                  : "bg-rose-600";
              const textColor =
                rate >= 0.85
                  ? "text-emerald-800"
                  : rate >= 0.6
                  ? "text-amber-600"
                  : "text-rose-600";

              const total = gestores.length;
              const positionClass =
                index < total / 3
                  ? "left-0"
                  : index > (total * 2) / 3
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";

              return (
                <div
                  key={gestor.id}
                  onClick={() => setSelectedGestor(gestor)}
                  className="group relative flex-1 flex justify-center h-full cursor-pointer"
                >
                  <div className="relative w-3 md:w-4 h-full bg-gray-100">
                    <div
                      className={`absolute bottom-0 left-0 w-full rounded-t-sm transition-colors ${barColor}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Pop-up tipo CRM */}
                  <div
                    className={`pointer-events-none absolute bottom-full mb-3 z-50 w-72 rounded-lg border border-gray-200 bg-white p-6 shadow-2xl opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${positionClass}`}
                  >
                    <p className="text-lg font-semibold tracking-tight text-[#0a0a0a]">
                      Gestor {String(gestor.id).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm text-[#737373]">
                      Rendimiento:{" "}
                      <span className="font-medium text-[#0a0a0a]">
                        {gestor.managed} / {gestor.assigned} gestionados
                      </span>
                    </p>

                    <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${barColor}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                    <p className={`mt-2 text-right text-xs font-mono ${textColor}`}>
                      {ratio.toFixed(1)}%
                    </p>

                    {rate < 0.85 && (
                      <p className="mt-3 text-xs font-medium text-amber-600">
                        Riesgo de cuello de botella
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-[#737373]">
            Mejor rendimiento del grupo: {maxRatio.toFixed(1)}%
          </p>
        </section>

        {/* Columna derecha: cumplimiento del equipo */}
        <section className="xl:col-span-2 flex flex-col gap-10">
          <Donut title="Cumplimiento del Equipo" segments={cumplimientoSegments} />
        </section>
      </div>

      {selectedGestor && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-lg font-semibold tracking-tight text-[#0a0a0a]">
                  Gestor {String(selectedGestor.id).padStart(2, "0")}
                </p>
                <p className="mt-1 text-3xl font-light tracking-tight text-[#0a0a0a]">
                  {((selectedGestor.managed / selectedGestor.assigned) * 100).toFixed(1)}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGestor(null)}
                className="rounded-full p-2 text-[#737373] transition-colors hover:bg-gray-100 hover:text-[#0a0a0a]"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <p className="mb-4 text-sm font-semibold text-[#0a0a0a]">
                Top 10 Expedientes
              </p>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[#737373]">
                    <th className="py-2 font-medium">ID Expediente</th>
                    <th className="py-2 font-medium">Importe</th>
                    <th className="py-2 font-medium">Score F2*</th>
                    <th className="py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {expedientes.map((exp) => (
                    <tr key={exp.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-[#0a0a0a]">{exp.id}</td>
                      <td className="py-3 text-[#0a0a0a]">€{exp.importe}</td>
                      <td className="py-3 text-[#0a0a0a]">{exp.score}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                          Gestionado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
