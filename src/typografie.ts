/**
 * Herkunft: Erfassungsbogen `src/app/typografie.ts` (Commit 1d7ed5f), nur der
 * reine Teil. Der DOM-Wächter (`anfuehrungWaechterStarten`) bleibt in den Apps
 * (Regel 2: kein DOM in diesem Baustein).
 *
 * Anführungszeichen (R17-W3): Die Texte der Apps öffnen mit „ (U+201E) und
 * schlossen vielerorts mit dem geraden " (U+0022). An den Senken der Dateien
 * (CSV, PDF) läuft jeder Text durch {@link anfuehrung}.
 */

/** „Name" → „Name“ — nur ein öffnendes „ ohne schließendes “ in derselben Zeile wird ergänzt. */
export function anfuehrung(text: string): string {
  return text.includes("„") ? text.replace(/„([^„“”"\n]*)"/g, "„$1“") : text;
}
