import { readDB, writeDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación del middleware
    const studentId = request.headers.get("x-user-id");

    if (!studentId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const cefrLevel = searchParams.get("cefr_level");
    const conceptTag = searchParams.get("concept_tag");

    // Leer la base de datos
    const db = readDB();

    // Filtrar guías
    let guides = db.guides || [];

    if (cefrLevel) {
      guides = guides.filter((g: any) => g.cefr_level === cefrLevel);
    }

    if (conceptTag) {
      guides = guides.filter((g: any) =>
        g.concept_tags.includes(conceptTag)
      );
    }

    // Enriquecer con información de progreso
    const guideProgress = db.guide_progress || [];
    const enrichedGuides = guides.map((guide: any) => {
      const progress = guideProgress.find(
        (gp: any) =>
          gp.student_id === studentId && gp.guide_id === guide.id
      );
      return {
        ...guide,
        progress: progress || null,
      };
    });

    return NextResponse.json({
      success: true,
      guides: enrichedGuides,
      total: enrichedGuides.length,
    });
  } catch (error) {
    console.error("[GUIDES_LIST]", error);
    return NextResponse.json(
      { error: "Error fetching guides" },
      { status: 500 }
    );
  }
}
