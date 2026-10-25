/**
 * Herkunft: Erfassungsbogen `src/app/pdf-stroeme.ts` (Commit 441811c). Geändert:
 * Die Länge eines Stroms kommt aus `/Length`, wo die PDF sie direkt nennt
 * (siehe pdfStroeme), und das Entpacken hat einen Deckel (siehe entpackt).
 *
 * Rohzugriff auf die Datenströme einer PDF — bewusst OHNE PDF-Parser-
 * Abhängigkeit. Unsere eigenen PDFs tragen ihre Nutzdaten als eingebettete
 * Datei (JSON, siehe pdf-dokument.ts) und als QR-Bild; beides steckt in
 * gewöhnlichen `stream … endstream`-Blöcken. Wer sie auswerten will, braucht
 * nur zweierlei: die Bytes des Stroms und das Wörterbuch davor (`/Filter`,
 * `/Width`, …).
 *
 * Genutzt von einsatz-transport.ts (eingebettetes JSON) und pdf-qr.ts (QR-Bild
 * als Rückfallebene, wenn eine PDF kein JSON mitbringt).
 */

import { Inflate } from "pako";

export interface PdfStrom {
  /** Das Wörterbuch vor `stream` als Text — grob, aber genug für /Filter & Co. */
  woerterbuch: string;
  /** Die rohen Bytes zwischen `stream` und `endstream`. */
  daten: Uint8Array;
}

/** Bytes → Latin1-String (chunkweise), um Stream-Marker per Offset zu finden. */
function latin1String(bytes: Uint8Array): string {
  let s = "";
  const schritt = 0x8000;
  for (let i = 0; i < bytes.length; i += schritt) {
    s += String.fromCharCode(...bytes.subarray(i, i + schritt));
  }
  return s;
}

/**
 * Alle Datenströme einer PDF. Das Wörterbuch wird als Textfenster vor dem
 * Schlüsselwort `stream` mitgegeben — vom Objektkopf („7 0 obj") an, damit
 * auch verschachtelte Angaben wie `/DecodeParms << … >>` vollständig drinstehen.
 * Das reicht, um Bildströme an /Subtype /Image und ihren Maßen zu erkennen.
 */
export function pdfStroeme(bytes: Uint8Array): PdfStrom[] {
  const latin1 = latin1String(bytes);
  const stroeme: PdfStrom[] = [];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(latin1))) {
    const start = m.index + m[0].length;
    const fenster = latin1.slice(Math.max(0, m.index - 800), m.index);
    const kopf = /\d+\s+\d+\s+obj\b/g;
    let letzter = -1;
    let k: RegExpExecArray | null;
    while ((k = kopf.exec(fenster))) letzter = k.index + k[0].length;
    const woerterbuch = letzter >= 0 ? fenster.slice(letzter) : fenster;
    let bis: number;
    // Mit /Length weiß die PDF selbst, wo die Daten enden. Ohne diese Angabe
    // schnitt die Suche nach „endstream" den Zeilenumbruch davor ab — und
    // endete ein komprimierter Strom zufällig auf dem Byte 0x0D, dazu ein
    // Datenbyte: Entpacken scheiterte, rund jede 256. Sammel-PDF ließ sich
    // nicht einlesen (gefunden 2026-10-25 an einem gelegentlich roten Test).
    const laenge = direkteLaenge(woerterbuch);
    if (laenge != null && /^\s*endstream/.test(latin1.slice(start + laenge, start + laenge + 16))) {
      bis = start + laenge;
      re.lastIndex = bis; // die Daten selbst nicht nach „stream" durchsuchen
    } else {
      const ende = latin1.indexOf("endstream", start);
      if (ende < 0) continue;
      // Vor „endstream" steht i. d. R. ein Zeilenumbruch, der nicht zum Strom
      // gehört. Ohne /Length bleibt das eine Annahme (s. o.).
      bis = ende;
      if (latin1[bis - 1] === "\n") bis--;
      if (latin1[bis - 1] === "\r") bis--;
    }
    stroeme.push({ woerterbuch, daten: bytes.subarray(start, bis) });
  }
  return stroeme;
}

/**
 * `/Length 1234` aus dem Wörterbuch — nur als direkte Zahl. Eine indirekte
 * Angabe (`/Length 12 0 R`) zeigt auf ein anderes Objekt; dann bleibt es bei
 * der Suche nach „endstream".
 */
function direkteLaenge(woerterbuch: string): number | null {
  const m = /\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(woerterbuch);
  return m ? Number(m[1]) : null;
}

/**
 * Höchstens so viele Bytes liefert ein einzelner Strom entpackt. Die größten
 * eigenen Ströme sind die eingebettete Sammlung (wenige MiB auch bei Hunderten
 * Einheiten) und QR-Bilder als Rohpixel (unter 4 MiB); 32 MiB lassen dafür
 * reichlich Luft und halten eine präparierte PDF auf, die aus wenigen
 * Kilobyte Gigabyte macht.
 */
export const MAX_STROM_ENTPACKT = 32 * 1024 * 1024;

/**
 * Strom entpacken (FlateDecode); null, wenn er nicht Flate-komprimiert ist
 * oder entpackt größer als `grenze` würde. pako liefert stückweise, die
 * Prüfung greift also, bevor der Speicher voll ist (wie `inflateRawBegrenzt`
 * im Erfassungsbogen, `hilfen.ts`).
 */
export function entpackt(strom: PdfStrom, grenze = MAX_STROM_ENTPACKT): Uint8Array | null {
  const inflater = new Inflate();
  const stuecke: Uint8Array[] = [];
  let summe = 0;
  let zuGross = false;
  inflater.onData = (stueck: Uint8Array) => {
    summe += stueck.length;
    if (summe > grenze) {
      zuGross = true;
      throw new RangeError("Strom zu groß");
    }
    stuecke.push(stueck);
  };
  try {
    inflater.push(strom.daten, true);
  } catch {
    return null;
  }
  if (zuGross || inflater.err) return null;
  // pako meldet einen abgeschnittenen Strom nicht als Fehler, sondern hört auf.
  if (!inflater.ended) return null;
  const ergebnis = new Uint8Array(summe);
  let stelle = 0;
  for (const stueck of stuecke) {
    ergebnis.set(stueck, stelle);
    stelle += stueck.length;
  }
  return ergebnis;
}
