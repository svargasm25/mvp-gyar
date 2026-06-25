import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { config } from 'dotenv';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

config();

const EXCEL_PATH = path.resolve(process.cwd(), 'dataset_gyar.xlsx');
const CHUNK_SIZE = 1000;
const NUM_AGENTS = 39;
const SUPERVISOR_ID = 40;

type ExcelRow = Record<string, unknown>;

interface ExpedienteRow {
  id_expediente: number;
  importe_deuda_eur: number;
  dias_en_gyar: number;
  tramo_dias: number;
  gestiones_previas_fallidas: number;
  prioridad_banco: number;
  estado_contacto: number;
  stage_ifrs9: number;
  score_f2: number | null;
  assigned_to: null;
  status: string;
  closed_at: null;
  closed_by: null;
}

function readExpedientesFromExcel(): ExpedienteRow[] {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  return rows.map((row) => ({
    id_expediente: Number(row.id_expediente),
    importe_deuda_eur: Number(row.importe_deuda_eur),
    dias_en_gyar: Number(row.dias_en_gyar),
    tramo_dias: Number(row.tramo_dias),
    gestiones_previas_fallidas: Number(row.gestiones_previas_fallidas),
    prioridad_banco: Number(row.prioridad_banco),
    estado_contacto: Number(row.estado_contacto),
    stage_ifrs9: Number(row.stage_ifrs9),
    score_f2: row.score_f2 != null ? Number(row.score_f2) : null,
    assigned_to: null,
    status: 'pending',
    closed_at: null,
    closed_by: null,
  }));
}

async function seedAgents(): Promise<void> {
  console.log('Vaciando tabla agents...');
  const { error: deleteError } = await supabase.from('agents').delete().gte('id', 0);
  if (deleteError) {
    throw new Error(`Error vaciando agents: ${deleteError.message}`);
  }

  const agents = [];
  for (let id = 1; id <= NUM_AGENTS; id++) {
    agents.push({
      id,
      display_name: `Gestor ${id}`,
      role: 'agent',
      capacity_min: 420,
    });
  }
  agents.push({
    id: SUPERVISOR_ID,
    display_name: 'Supervisor General',
    role: 'supervisor',
    capacity_min: 0,
  });

  console.log(`Insertando ${agents.length} agentes...`);
  const { error: insertError } = await supabase.from('agents').insert(agents);
  if (insertError) {
    throw new Error(`Error insertando agents: ${insertError.message}`);
  }
  console.log('Agentes creados correctamente.');
}

async function seedExpedientes(expedientes: ExpedienteRow[]): Promise<void> {
  const totalChunks = Math.ceil(expedientes.length / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const lote = expedientes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const { error } = await supabase.from('expedientes').insert(lote);
    if (error) {
      throw new Error(`Error insertando lote ${i + 1}/${totalChunks}: ${error.message}`);
    }
    console.log(`Lote ${i + 1}/${totalChunks} insertado...`);
  }
}

async function main(): Promise<void> {
  await seedAgents();

  const expedientes = readExpedientesFromExcel();
  console.log(`Expedientes leidos del Excel: ${expedientes.length}`);

  await seedExpedientes(expedientes);

  console.log('Ingesta completada.');
}

main().catch((err) => {
  console.error('Fallo en la ingesta:', err);
  process.exit(1);
});
