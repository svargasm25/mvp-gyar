"use client";

import { use, useEffect, useState } from "react";

interface Expediente {
  id_expediente: number;
  importe_deuda_eur: number;
  dias_en_gyar: number;
  estado_contacto: number;
  score_f2?: number;
  [key: string]: unknown;
}

type CognitiveState = "NORMAL" | "ALTA_TENSION" | "ATASCADO";

interface NextCaseResponse {
  recommendedCase: Expediente | null;
  state: CognitiveState;
  bannerText: string;
  top10: Expediente[];
}

const ESTADO_CONTACTO_LABELS: Record<number, string> = {
  0: "Sin gestionar",
  1: "Sin contacto",
  2: "Localizado",
  3: "Promesa de pago",
  4: "Reprogramado",
  6: "Ilocalizable",
};

const DNI_LETTERS = "ABCDEFGHJKLMNPQRSTVWXYZ";

function pseudoRandom(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function buildMockClientInfo(idExpediente: number) {
  const nombre = `Cliente #${idExpediente}`;

  const dniDigits = String(100 + Math.floor(pseudoRandom(idExpediente, 1) * 900));
  const dniLetter =
    DNI_LETTERS[Math.floor(pseudoRandom(idExpediente, 2) * DNI_LETTERS.length)];
  const dni = `****${dniDigits}${dniLetter}`;

  const telefonoDigit2 = Math.floor(pseudoRandom(idExpediente, 3) * 10);
  const telefonoDigit3 = Math.floor(pseudoRandom(idExpediente, 4) * 10);
  const telefono = `6${telefonoDigit2}${telefonoDigit3} *** ***`;

  return { nombre, dni, telefono };
}

function FichaRiesgoDato({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#737373]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#0a0a0a]">{value}</p>
    </div>
  );
}

export default function GestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<NextCaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  async function loadNextCase() {
    setLoading(true);
    try {
      const res = await fetch(`/api/next-case/${id}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNextCase();
  }, [id]);

  async function handleRegistrarGestion() {
    const expediente = data?.recommendedCase;
    if (!expediente) return;

    setRegistrando(true);
    try {
      await fetch("/api/close-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expedienteId: expediente.id_expediente,
          agentId: Number(id),
        }),
      });

      await loadNextCase();
    } finally {
      setRegistrando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <p className="text-sm text-[#737373]">Cargando siguiente caso...</p>
      </div>
    );
  }

  const exp = data?.recommendedCase ?? null;
  const cliente = exp ? buildMockClientInfo(exp.id_expediente) : null;
  const top10 = data?.top10 ?? [];

  return (
    <div className="flex flex-1 flex-col bg-white px-6 py-12">
      <p className="mb-6 text-sm text-[#737373]">Gestor {id}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start">
        <div>
          {exp && cliente ? (
            <div className="border border-[#0a0a0a] px-10 py-10 text-center">
              <p className="text-sm font-medium text-[#0a0a0a]">
                {cliente.nombre}
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-[#737373]">
                <span>DNI {cliente.dni}</span>
                <span>Tel. {cliente.telefono}</span>
              </div>

              <p className="mt-8 text-sm uppercase tracking-wide text-[#737373]">
                Importe de la deuda
              </p>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-[#0a0a0a]">
                {exp.importe_deuda_eur.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#737373]">
                    Días de impago
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
                    {exp.dias_en_gyar}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#737373]">
                    Estado
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#0a0a0a]">
                    {ESTADO_CONTACTO_LABELS[exp.estado_contacto] ?? "Desconocido"}
                  </p>
                </div>
              </div>

              {data && (
                <div className="mt-8">
                  {data.state === "ALTA_TENSION" || data.state === "ATASCADO" ? (
                    <p className="bg-[#fef3c7] px-3 py-2 text-sm font-medium text-[#a16207]">
                      {data.bannerText}
                    </p>
                  ) : (
                    <p className="text-xs text-[#737373]">{data.bannerText}</p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleRegistrarGestion}
                disabled={registrando}
                className="mt-8 w-full bg-[#0a0a0a] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:bg-[#737373]"
              >
                {registrando ? "Cargando..." : "Registrar Gestión"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#737373]">
              No hay casos pendientes asignados.
            </p>
          )}
        </div>

        <div>
          {exp && (
            <details
              open
              className="group rounded-lg border border-gray-200 p-4"
            >
              <summary className="cursor-pointer text-left text-sm font-medium text-[#0a0a0a]">
                Ficha Técnica de Riesgo (CIRBE / IFRS9)
              </summary>
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#f5f5f5] pt-4 text-left sm:grid-cols-2">
                <FichaRiesgoDato
                  label="Empleador"
                  value="Inditex S.A. (Contrato Indefinido)"
                />
                <FichaRiesgoDato
                  label="Ingresos declarados"
                  value="2.450 € / mes"
                />
                <FichaRiesgoDato
                  label="Scoring Interno"
                  value="C- (Riesgo Moderado)"
                />
                <FichaRiesgoDato
                  label="Dispuesto en otras entidades (CIRBE)"
                  value="14.200 €"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob(
                      [
                        "OPPLUS - EXPEDIENTE DE AUDITORÍA IFRS9\n---------------------------------------\nID: " +
                          exp.id_expediente +
                          "\nDeuda: " +
                          exp.importe_deuda_eur +
                          " EUR\nEstado: Calificado para reestructuración",
                      ],
                      { type: "application/pdf" }
                    );
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `Expediente_IFRS9_${exp.id_expediente}.pdf`;
                    link.click();
                  }}
                  className="border border-[#0a0a0a] px-4 py-2 text-xs font-medium text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
                >
                  📄 Descargar Expediente (PDF)
                </button>
              </div>
            </details>
          )}

          <div className="mt-8 border border-[#e5e5e5] px-6 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-[#737373]">
                Mi Cola de Trabajo (Top 10)
              </h2>
              <span className="text-xs text-[#737373]">
                {top10.length} expediente{top10.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5] text-xs uppercase tracking-wide text-[#737373]">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Importe</th>
                    <th className="py-2 pr-4">Días en GYAR</th>
                    <th className="py-2 pr-4">Score F2*</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.length > 0 ? (
                    top10.map((item) => (
                      <tr
                        key={item.id_expediente}
                        className="border-b border-[#f5f5f5] text-[#0a0a0a]"
                      >
                        <td className="py-2 pr-4">{item.id_expediente}</td>
                        <td className="py-2 pr-4">
                          {item.importe_deuda_eur.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </td>
                        <td className="py-2 pr-4">{item.dias_en_gyar}</td>
                        <td className="py-2 pr-4">
                          {item.score_f2 != null
                            ? item.score_f2.toFixed(2)
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-[#737373]"
                      >
                        No hay expedientes en la cola.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
