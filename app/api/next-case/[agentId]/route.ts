import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { getAgentNextCase } from '../../../../lib/cognitive';
import type { Expediente } from '../../../../lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId: agentIdParam } = await params;
    const agentId = Number(agentIdParam);

    if (!Number.isFinite(agentId)) {
      return NextResponse.json({ error: 'agentId invalido' }, { status: 400 });
    }

    const { data: personalQueue, error: queueError } = await supabase
      .from('expedientes')
      .select(
        'id_expediente, importe_deuda_eur, dias_en_gyar, gestiones_previas_fallidas, prioridad_banco, estado_contacto, stage_ifrs9, score_f2, assigned_to, status, closed_at'
      )
      .eq('assigned_to', agentId)
      .eq('status', 'pending')
      .order('score_f2', { ascending: false })
      .limit(10);

    if (queueError) {
      throw new Error(`Error consultando cola personal: ${queueError.message}`);
    }

    const { data: lastThreeClosed, error: closedError } = await supabase
      .from('expedientes')
      .select(
        'id_expediente, importe_deuda_eur, dias_en_gyar, gestiones_previas_fallidas, prioridad_banco, estado_contacto, stage_ifrs9, score_f2, assigned_to, status, closed_at'
      )
      .eq('closed_by', agentId)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(3);

    if (closedError) {
      throw new Error(`Error consultando ultimas gestiones cerradas: ${closedError.message}`);
    }

    const result = getAgentNextCase(
      (personalQueue ?? []) as Expediente[],
      (lastThreeClosed ?? []) as Expediente[]
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
