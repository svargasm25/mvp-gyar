import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

interface CloseCaseBody {
  expedienteId: number;
  agentId: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CloseCaseBody;
    const { expedienteId, agentId } = body;

    if (!Number.isFinite(expedienteId) || !Number.isFinite(agentId)) {
      return NextResponse.json(
        { error: "expedienteId y agentId son obligatorios y deben ser numéricos" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("expedientes")
      .update({
        status: "closed",
        closed_by: agentId,
        closed_at: new Date().toISOString(),
      })
      .eq("id_expediente", expedienteId);

    if (error) {
      throw new Error(`Error cerrando expediente: ${error.message}`);
    }

    return NextResponse.json(
      { message: "Gestión registrada correctamente." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
