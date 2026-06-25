import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Pico de demanda simulado correctamente." },
    { status: 200 }
  );
}
