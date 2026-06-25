import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import type { Agent, Expediente } from '../../../lib/types';

const SELECT_PAGE_SIZE = 1000;

async function fetchAllAssignedExpedientes(): Promise<
  Pick<Expediente, 'assigned_to' | 'status'>[]
> {
  const expedientes: Pick<Expediente, 'assigned_to' | 'status'>[] = [];
  let from = 0;

  while (true) {
    const to = from + SELECT_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('expedientes')
      .select('assigned_to, status')
      .not('assigned_to', 'is', null)
      .range(from, to);

    if (error) {
      throw new Error(`Error consultando expedientes: ${error.message}`);
    }

    const page = (data ?? []) as Pick<Expediente, 'assigned_to' | 'status'>[];
    expedientes.push(...page);

    if (page.length < SELECT_PAGE_SIZE) break;
    from += SELECT_PAGE_SIZE;
  }

  return expedientes;
}

export async function GET() {
  try {
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, capacity_min')
      .eq('role', 'agent');

    if (agentsError) {
      throw new Error(`Error consultando agents: ${agentsError.message}`);
    }

    const allExpedientes = await fetchAllAssignedExpedientes();

    const countsByAgent = new Map<number, { pending: number; closed: number }>();
    for (const exp of allExpedientes) {
      if (exp.assigned_to == null) continue;
      const counts = countsByAgent.get(exp.assigned_to) ?? { pending: 0, closed: 0 };
      if (exp.status === 'pending') counts.pending += 1;
      if (exp.status === 'closed') counts.closed += 1;
      countsByAgent.set(exp.assigned_to, counts);
    }

    const gestores = ((agents ?? []) as Pick<Agent, 'id' | 'capacity_min'>[])
      .map((agent) => ({
        id: agent.id,
        capacity_min: agent.capacity_min,
        asignados: countsByAgent.get(agent.id)?.pending ?? 0,
        cerrados: countsByAgent.get(agent.id)?.closed ?? 0,
      }))
      .sort((a, b) => a.id - b.id);

    const { data: ultimosExpedientes, error: ultimosError } = await supabase
      .from('expedientes')
      .select('id_expediente, importe_deuda_eur, assigned_to, status, closed_at')
      .not('assigned_to', 'is', null)
      .order('id_expediente', { ascending: false })
      .limit(50);

    if (ultimosError) {
      throw new Error(`Error consultando ultimos expedientes: ${ultimosError.message}`);
    }

    return NextResponse.json(
      {
        gestores,
        ultimos_expedientes: ultimosExpedientes ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
