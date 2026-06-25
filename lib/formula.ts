import type { Expediente } from './types';

const OVERRIDE_BONUS = 1_000_000;

function lnImporte(importe_deuda_eur: number): number {
  return Math.log(1 + importe_deuda_eur);
}

function pRec(dias_en_gyar: number): number {
  if (dias_en_gyar <= 30) return 0.8;
  if (dias_en_gyar <= 60) return 0.55;
  if (dias_en_gyar <= 90) return 0.35;
  return 0.15;
}

function uUrgencia(dias_en_gyar: number): number {
  return 1 + 4 * Math.exp((dias_en_gyar - 60) / 12);
}

function pBanco(prioridad_banco: 1 | 2 | 3): number {
  return prioridad_banco;
}

function cCont(estado_contacto: number): number {
  switch (estado_contacto) {
    case 3:
      return 2.0;
    case 2:
      return 1.5;
    case 4:
      return 1.2;
    case 0:
      return 1.0;
    case 1:
      return 0.6;
    case 6:
      return 0.3;
    default:
      return 1.0;
  }
}

export function getTramoMinutos(dias: number): number {
  if (dias <= 30) return 4.2;
  if (dias <= 60) return 5.8;
  if (dias <= 90) return 7.1;
  return 9.3;
}

function fHist(gestiones_previas_fallidas: number): number {
  if (gestiones_previas_fallidas === 0) return 1.0;
  if (gestiones_previas_fallidas === 1) return 1.3;
  if (gestiones_previas_fallidas === 2) return 1.6;
  return 2.0;
}

export function calculateF2Score(exp: Expediente, overrideStage3: boolean): number {
  const numerador =
    lnImporte(exp.importe_deuda_eur) *
    pRec(exp.dias_en_gyar) *
    uUrgencia(exp.dias_en_gyar) *
    pBanco(exp.prioridad_banco) *
    cCont(exp.estado_contacto);

  const denominador = getTramoMinutos(exp.dias_en_gyar) * fHist(exp.gestiones_previas_fallidas);

  let score = numerador / denominador;

  if (overrideStage3 && exp.dias_en_gyar > 90) {
    score += OVERRIDE_BONUS;
  }

  return score;
}
