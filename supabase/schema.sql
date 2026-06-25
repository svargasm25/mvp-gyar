-- MVP GYAR - Schema Postgres (Supabase)
-- Sin RLS.

create table if not exists agents (
  id smallint primary key,
  display_name text,
  role text,
  capacity_min int
);

create table if not exists expedientes (
  id_expediente bigint primary key,
  importe_deuda_eur numeric,
  dias_en_gyar int,
  tramo_dias smallint,
  gestiones_previas_fallidas smallint,
  prioridad_banco smallint,
  estado_contacto smallint,
  stage_ifrs9 smallint,
  score_f2 numeric,
  assigned_to smallint references agents (id),
  status text default 'pending',
  closed_at timestamptz,
  closed_by smallint references agents (id)
);

create index if not exists idx_expedientes_assigned_status
  on expedientes (assigned_to, status);

create index if not exists idx_expedientes_closedby_closedat
  on expedientes (closed_by, closed_at desc);
