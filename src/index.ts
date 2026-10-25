/**
 * @bos/eeb-satz — Ausgabe des Einheiten-Erfassungsbogens ohne Oberfläche.
 *
 * Entsteht in Phase 1 der Meldekopf-Übernahme aus dem Erfassungsbogen
 * (docs/uebernahme-aus-erfassungsbogen.md im Repo wattnpapa/meldekopf,
 * Abschnitt B). Die Module kommen mit ihren Tests und Kopfkommentaren aus
 * `src/app/` des Erfassungsbogens (Commit 441811c). Erste Stufe:
 *
 *   csv, xlsx
 *   pdf-bilder, pdf-stroeme
 *   taktische-zeichen-bogen, uebung-wasserzeichen
 *
 * Später (hängen im Erfassungsbogen noch an App-Modulen, s. README):
 *   pdf-dokument, blanko, bogen-csv, einsatz-csv, oldenburg-xlsx,
 *   qr-boegen, pdf-qr
 *
 * Importiert wird modulgenau (`@bos/eeb-satz/pdf-dokument`), nicht über diese
 * Fassade. Sie bleibt leer, damit kein Konsument versehentlich alles zieht.
 */
export {};
