import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { distributeWorkload } from '../../../lib/distribution';
import type { Agent, Expediente } from '../../../lib/types';

const SELECT_PAGE_SIZE = 1000;

async function fetchAllPendingExpedientes(): Promise<Expediente[]> {
  const expedientes: Expediente[] = [];
  let from = 0;

  while (true) {
    const to = from + SELECT_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('expedientes')
      .select(
        'id_expediente, importe_deuda_eur, dias_en_gyar, gestiones_previas_fallidas, prioridad_banco, estado_contacto, stage_ifrs9, score_f2, assigned_to, status, closed_at'
      )
      .eq('status', 'pending')
      .range(from, to);

    if (error) {
      throw new Error(`Error consultando expedientes: ${error.message}`);
    }

    const page = (data ?? []) as Expediente[];
    expedientes.push(...page);

    if (page.length < SELECT_PAGE_SIZE) break;
    from += SELECT_PAGE_SIZE;
  }

  return expedientes;
}

export async function POST() {
  try {
    const expedientes = await fetchAllPendingExpedientes();

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, display_name, role, capacity_min')
      .eq('role', 'agent');

    if (agentsError) {
      throw new Error(`Error consultando agents: ${agentsError.message}`);
    }

    const result = distributeWorkload(expedientes, (agents ?? []) as Agent[], true);

    const updates = result.assignedCases.map((exp) => ({
      id_expediente: exp.id_expediente,
      score_f2: exp.score_f2,
      assigned_to: exp.assigned_to,
    }));

    const UPSERT_CHUNK_SIZE = 1000;
    for (let i = 0; i < updates.length; i += UPSERT_CHUNK_SIZE) {
      const lote = updates.slice(i, i + UPSERT_CHUNK_SIZE);
      const { error: upsertError } = await supabase
        .from('expedientes')
        .upsert(lote, { onConflict: 'id_expediente' });

      if (upsertError) {
        throw new Error(`Error en upsert de lote: ${upsertError.message}`);
      }
    }

    return NextResponse.json(
      {
        total_procesados: expedientes.length,
        total_asignados: result.assignedCases.length,
        total_backlog: result.unassignedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
