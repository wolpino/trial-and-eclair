/** Deterministic slight tilt for cork board notes (-3° … +3°). */
export function rotationFromIdeaId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  return (hash % 7) - 3;
}
