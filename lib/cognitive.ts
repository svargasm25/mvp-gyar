import type { CognitiveState, Expediente } from './types';

const TOP_N = 10;

function isAltaTension(exp: Expediente): boolean {
  return exp.estado_contacto === 3 || exp.importe_deuda_eur > 50000;
}

function isAtascado(exp: Expediente): boolean {
  return exp.estado_contacto === 6 || exp.gestiones_previas_fallidas >= 3;
}

function detectState(lastThreeClosed: Expediente[]): CognitiveState {
  if (lastThreeClosed.length < 3) return 'NORMAL';

  const tensionCount = lastThreeClosed.filter(isAltaTension).length;
  if (tensionCount >= 2) return 'ALTA_TENSION';

  const atascadoCount = lastThreeClosed.filter(isAtascado).length;
  if (atascadoCount >= 2) return 'ATASCADO';

  return 'NORMAL';
}

function pickMenorDias(top10: Expediente[]): Expediente | null {
  if (top10.length === 0) return null;
  return top10.reduce((menor, exp) => (exp.dias_en_gyar < menor.dias_en_gyar ? exp : menor));
}

export function getAgentNextCase(
  personalQueue: Expediente[],
  lastThreeClosed: Expediente[]
): {
  recommendedCase: Expediente | null;
  state: CognitiveState;
  bannerText: string;
  top10: Expediente[];
} {
  const state = detectState(lastThreeClosed);
  const top10 = personalQueue.slice(0, TOP_N);

  if (state === 'ALTA_TENSION') {
    return {
      recommendedCase: pickMenorDias(top10),
      state,
      bannerText: 'Alerta de fatiga. Caso re-priorizado a Baja Fricción.',
      top10,
    };
  }

  if (state === 'ATASCADO') {
    const reprogramado = top10.find((exp) => exp.estado_contacto === 4) ?? null;
    return {
      recommendedCase: reprogramado ?? pickMenorDias(top10),
      state,
      bannerText: 'Racha de ilocalizables. Caso priorizado por probabilidad de contacto.',
      top10,
    };
  }

  return {
    recommendedCase: personalQueue[0] ?? null,
    state,
    bannerText: 'Asignación estándar F2* activa.',
    top10,
  };
}
