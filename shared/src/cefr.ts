/**
 * Niveles MCER (CEFR) del motor de progresión.
 *
 * Fuente única de verdad del tipo, el orden de progresión, los umbrales de
 * aprobación y las etiquetas en español. Backend y frontend deben importar
 * de aquí en lugar de redefinir sus propias listas.
 */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

/** Orden de menor a mayor dominio; base de la progresión de nivel. */
export const CEFR_PROGRESSION: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

/** Puntuación mínima (0-100) para aprobar una misión en cada nivel. */
export const CEFR_THRESHOLDS: Record<CefrLevel, number> = {
  A1: 60,
  A2: 70,
  B1: 80,
  B2: 85,
  C1: 90,
}

const CEFR_LABELS: Record<CefrLevel, string> = {
  A1: 'Principiante',
  A2: 'Básico',
  B1: 'Intermedio',
  B2: 'Intermedio Alto',
  C1: 'Avanzado',
}

/** Etiqueta en español de un nivel; si no se reconoce, devuelve el valor tal cual. */
export function getCefrLabel(level: string): string {
  return CEFR_LABELS[level as CefrLevel] ?? level
}
