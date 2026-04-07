import { readDB } from "@/lib/db";
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

    const db = readDB();
    const conceptTags = new Set<string>();

    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const detectedConcepts = searchParams.get("concepts")?.split(",") || [];
    const cefrLevel = searchParams.get("cefr_level");

    // Filtrar guías basadas en conceptos detectados y nivel CEFR
    let recommendedGuides = (db.guides || []).filter((guide: any) => {
      // Verificar si la guía cubre los conceptos detectados
      const hasConcept = guide.concept_tags.some((tag: any) =>
        detectedConcepts.includes(tag)
      );

      // Filtrar por nivel CEFR si se proporciona
      const matchesCefr = cefrLevel
        ? guide.cefr_level === cefrLevel
        : true;

      return hasConcept && matchesCefr;
    });

    // Enriquecer con información de progreso
    const guideProgress = db.guide_progress || [];
    const enrichedGuides = recommendedGuides.map((guide: any) => {
      const progress = guideProgress.find(
        (gp: any) =>
          gp.student_id === studentId && gp.guide_id === guide.id
      );
      return {
        ...guide,
        progress: progress || null,
      };
    });

    // Limitar a 5 recomendaciones
    const topRecommendations = enrichedGuides.slice(0, 5);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      concepts_detected: detectedConcepts,
    });
  } catch (error) {
    console.error("[GUIDE_RECOMMENDATIONS]", error);
    return NextResponse.json(
      { error: "Error fetching recommendations" },
      { status: 500 }
    );
  }
}
