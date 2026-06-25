import { distributeWorkload } from '../lib/distribution';
import type { Agent, Expediente } from '../lib/types';

const NUM_AGENTS = 39;
const NUM_EXPEDIENTES = 12000;
const CAPACITY_MIN = 420;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function buildAgents(): Agent[] {
  const agents: Agent[] = [];
  for (let i = 1; i <= NUM_AGENTS; i++) {
    agents.push({
      id: i,
      display_name: `Agente ${i}`,
      role: 'agent',
      capacity_min: CAPACITY_MIN,
    });
  }
  return agents;
}

function buildExpedientes(): Expediente[] {
  const expedientes: Expediente[] = [];

  for (let i = 1; i <= NUM_EXPEDIENTES; i++) {
    const roll = Math.random();
    let dias_en_gyar: number;

    if (roll < 0.7) {
      dias_en_gyar = Math.floor(randomBetween(1, 60));
    } else if (roll < 0.9) {
      dias_en_gyar = Math.floor(randomBetween(60, 90));
    } else {
      dias_en_gyar = Math.floor(randomBetween(91, 365));
    }

    const importe_deuda_eur = Math.round(randomBetween(100, 150000) * 100) / 100;
    const estadosPosibles = [0, 1, 2, 3, 4, 6];
    const estado_contacto = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
    const prioridadesPosibles: (1 | 2 | 3)[] = [1, 2, 3];
    const prioridad_banco = prioridadesPosibles[Math.floor(Math.random() * prioridadesPosibles.length)];
    const gestiones_previas_fallidas = Math.floor(randomBetween(0, 5));
    const stage_ifrs9: 1 | 2 | 3 = dias_en_gyar > 90 ? 3 : dias_en_gyar > 30 ? 2 : 1;

    expedientes.push({
      id_expediente: i,
      importe_deuda_eur,
      dias_en_gyar,
      gestiones_previas_fallidas,
      prioridad_banco,
      estado_contacto,
      stage_ifrs9,
      status: 'pending',
    });
  }

  return expedientes;
}

function main(): void {
  const agents = buildAgents();
  const expedientes = buildExpedientes();

  const totalStage3 = expedientes.filter((exp) => exp.dias_en_gyar > 90).length;

  const result = distributeWorkload(expedientes, agents, true);

  const assignedStage3 = result.assignedCases.filter((exp) => exp.dias_en_gyar > 90).length;

  const loads = Object.values(result.agentLoads);
  const totalMinutos = loads.reduce((acc, min) => acc + min, 0);
  const mediaMinutos = totalMinutos / agents.length;
  const minMinutos = Math.min(...loads);
  const maxMinutos = Math.max(...loads);

  const lines: string[] = [];
  lines.push('================================================');
  lines.push('   MVP GYAR - HOUR 1 SANITY CHECK (12.000 EXP.)  ');
  lines.push('================================================');
  lines.push('');
  lines.push(`Total expedientes generados : ${expedientes.length}`);
  lines.push(`Total expedientes asignados : ${result.assignedCases.length}`);
  lines.push(`Backlog (sin asignar)       : ${result.unassignedCount}`);
  lines.push('');
  lines.push('--- CARGA POR AGENTE (minutos) ---');
  lines.push(`Media   : ${mediaMinutos.toFixed(2)} min`);
  lines.push(`Minimo  : ${minMinutos.toFixed(2)} min`);
  lines.push(`Maximo  : ${maxMinutos.toFixed(2)} min`);
  lines.push('');
  lines.push('--- COBERTURA STAGE 3 (dias_en_gyar > 90) ---');
  lines.push(`Stage 3 generados  : ${totalStage3}`);
  lines.push(`Stage 3 asignados  : ${assignedStage3}`);
  lines.push(
    `Cobertura 100%     : ${totalStage3 === assignedStage3 ? 'OK [PASS]' : 'FALLO [FAIL]'}`
  );
  lines.push('================================================');

  console.log(lines.join('\n'));
}

main();
