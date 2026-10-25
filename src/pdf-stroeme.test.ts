/**
 * Ströme einer PDF roh lesen: die Länge aus `/Length`, wo vorhanden.
 *
 * Anlass: Ein komprimierter Strom, dessen letztes Datenbyte 0x0D ist, verlor
 * beim Abschneiden des Zeilenumbruchs vor „endstream" dieses Byte, und das
 * Entpacken scheiterte — rund jede 256. Sammel-PDF.
 */
import { describe, expect, it } from "vitest";
import { deflate } from "pako";
import { entpackt, pdfStroeme } from "./pdf-stroeme";

const kodierer = new TextEncoder();

function pdf(woerterbuch: string, daten: Uint8Array): Uint8Array {
  const vor = kodierer.encode(`%PDF-1.7\n1 0 obj\n<< ${woerterbuch} >>\nstream\n`);
  const nach = kodierer.encode("\nendstream\nendobj\n%%EOF");
  const aus = new Uint8Array(vor.length + daten.length + nach.length);
  aus.set(vor, 0);
  aus.set(daten, vor.length);
  aus.set(nach, vor.length + daten.length);
  return aus;
}

describe("pdfStroeme()", () => {
  it("nimmt die Länge aus /Length — auch wenn das letzte Datenbyte ein Wagenrücklauf ist", () => {
    const daten = new Uint8Array([1, 2, 3, 0x0d]);
    const [strom] = pdfStroeme(pdf(`/Length ${daten.length}`, daten));
    expect([...strom!.daten]).toEqual([1, 2, 3, 0x0d]);
  });

  it("entpackt einen Strom, dessen komprimierte Daten auf 0x0D enden", () => {
    // Inhalt suchen, dessen Deflate-Ergebnis auf 0x0D endet. Das letzte Byte
    // ist das untere der Adler-Summe A (1 + Summe aller Bytes): Ein letztes
    // Datenbyte, das alle 256 Werte durchläuft, trifft es sicher.
    let inhalt = new Uint8Array();
    let gepackt = deflate(inhalt);
    for (let c = 0; c < 256 && gepackt[gepackt.length - 1] !== 0x0d; c++) {
      inhalt = new Uint8Array([...kodierer.encode('{"typ":"eeb-einsatz"}'), c]);
      gepackt = deflate(inhalt);
    }
    expect(gepackt[gepackt.length - 1]).toBe(0x0d);
    const [strom] = pdfStroeme(pdf(`/Filter /FlateDecode /Length ${gepackt.length}`, gepackt));
    expect([...entpackt(strom!)!]).toEqual([...inhalt]);
  });

  it("ohne /Length bleibt es bei der Suche nach „endstream“ samt Zeilenumbruch", () => {
    const [strom] = pdfStroeme(pdf("/Filter /FlateDecode", new Uint8Array([7, 8, 9])));
    expect([...strom!.daten]).toEqual([7, 8, 9]);
  });

  it("eine indirekte Länge (/Length 5 0 R) gilt nicht als Zahl", () => {
    const [strom] = pdfStroeme(pdf("/Length 5 0 R", new Uint8Array([7, 8, 9])));
    expect([...strom!.daten]).toEqual([7, 8, 9]);
  });

  it("eine falsche Länge (endstream steht nicht dahinter) fällt auf die Suche zurück", () => {
    const [strom] = pdfStroeme(pdf("/Length 1", new Uint8Array([7, 8, 9])));
    expect([...strom!.daten]).toEqual([7, 8, 9]);
  });
});

describe("entpackt()", () => {
  it("liefert null, wenn der Strom entpackt über die Grenze wächst", () => {
    const gross = deflate(new Uint8Array(1024 * 1024)); // 1 MiB Nullen, gepackt rund 1 KiB
    const [strom] = pdfStroeme(pdf(`/Length ${gross.length} /Filter /FlateDecode`, gross));
    expect(entpackt(strom!, 64 * 1024)).toBeNull();
    expect(entpackt(strom!)?.length).toBe(1024 * 1024);
  });

  it("liefert null für einen abgeschnittenen Strom", () => {
    const gepackt = deflate(kodierer.encode("x".repeat(5000) + Math.random()));
    const halb = gepackt.subarray(0, Math.floor(gepackt.length / 2));
    const [strom] = pdfStroeme(pdf(`/Length ${halb.length}`, halb));
    expect(entpackt(strom!)).toBeNull();
  });

  it("liefert null für Daten, die gar nicht Flate-komprimiert sind", () => {
    const [strom] = pdfStroeme(pdf("/Length 4", new Uint8Array([1, 2, 3, 4])));
    expect(entpackt(strom!)).toBeNull();
  });
});
