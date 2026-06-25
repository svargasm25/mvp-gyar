import type { Agent, Expediente } from './types';
import { calculateF2Score, getTramoMinutos } from './formula';

export interface DistributionResult {
  assignedCases: Expediente[];
  unassignedCount: number;
  agentLoads: Record<number, number>;
}

export function distributeWorkload(
  expedientes: Expediente[],
  agents: Agent[],
  overrideStage3: boolean
): DistributionResult {
  const pendientes = expedientes.filter((exp) => exp.status === 'pending');

  for (const exp of pendientes) {
    exp.score_f2 = calculateF2Score(exp, overrideStage3);
  }

  pendientes.sort((a, b) => (b.score_f2 as number) - (a.score_f2 as number));

  const agentLoads: Record<number, number> = {};
  for (const agent of agents) {
    agentLoads[agent.id] = 0;
  }

  const assignedCases: Expediente[] = [];
  let unassignedCount = 0;

  let stage3Cases: Expediente[] = [];
  let restoCases = pendientes;

  if (overrideStage3) {
    stage3Cases = pendientes.filter((exp) => exp.dias_en_gyar > 90);
    const stage3Ids = new Set(stage3Cases.map((exp) => exp.id_expediente));
    restoCases = pendientes.filter((exp) => !stage3Ids.has(exp.id_expediente));

    let agentIndex = 0;
    for (const exp of stage3Cases) {
      const agent = agents[agentIndex % agents.length];
      const tramo = getTramoMinutos(exp.dias_en_gyar);
      exp.assigned_to = agent.id;
      agentLoads[agent.id] += tramo;
      assignedCases.push(exp);
      agentIndex++;
    }
  }

  for (const exp of restoCases) {
    const tramo = getTramoMinutos(exp.dias_en_gyar);

    let mejorAgente: Agent | null = null;
    for (const agent of agents) {
      if (agentLoads[agent.id] + tramo > agent.capacity_min) continue;
      if (mejorAgente === null || agentLoads[agent.id] < agentLoads[mejorAgente.id]) {
        mejorAgente = agent;
      }
    }

    if (mejorAgente) {
      exp.assigned_to = mejorAgente.id;
      agentLoads[mejorAgente.id] += tramo;
      assignedCases.push(exp);
    } else {
      exp.assigned_to = undefined;
      unassignedCount++;
    }
  }

  return { assignedCases, unassignedCount, agentLoads };
}
