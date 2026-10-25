/**
 * Das eine Web-Standard-Global, das die Ausgabe braucht — hier von Hand
 * deklariert, nach dem Vorbild von `plattform.d.ts` in `@bos/meldekopf`.
 *
 * `TextEncoder` gibt es in jeder Zielumgebung (Node seit 11, jeder Browser,
 * jede WebView); der XLSX-Schreiber wandelt damit die XML-Teile in UTF-8.
 * Sein TYP kommt jedoch nur über `lib.dom` oder `@types/node`, und beides ist
 * in `tsconfig.json` bewusst abgeschaltet (ADR-003, Aufnahmeregel 2).
 * Deklariert ist nur, was tatsächlich aufgerufen wird.
 */

declare class TextEncoder {
  encode(text?: string): Uint8Array;
}
