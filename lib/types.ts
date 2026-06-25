export type CognitiveState = 'NORMAL' | 'ALTA_TENSION' | 'ATASCADO';

export interface Expediente {
  id_expediente: number;
  importe_deuda_eur: number;
  dias_en_gyar: number;
  gestiones_previas_fallidas: number;
  prioridad_banco: 1 | 2 | 3;
  estado_contacto: number; // 0=Sin gestionar, 1=Sin contacto, 2=Localizado, 3=Promesa pago, 4=Reprogramado, 6=Ilocalizable
  stage_ifrs9: 1 | 2 | 3; // 3 si dias > 90
  score_f2?: number;
  assigned_to?: number; // id de agente (1..39)
  status: 'pending' | 'closed' | 'hidden';
  closed_at?: Date;
}

export interface Agent {
  id: number;
  display_name: string;
  role: 'agent' | 'supervisor';
  capacity_min: number;
}
