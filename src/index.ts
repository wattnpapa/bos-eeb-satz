/**
 * @bos/eeb-satz — Ausgabe des Einheiten-Erfassungsbogens ohne Oberfläche.
 *
 * Entsteht in Phase 1 der Meldekopf-Übernahme aus dem Erfassungsbogen
 * (docs/uebernahme-aus-erfassungsbogen.md im Repo wattnpapa/meldekopf,
 * Abschnitt B). Bis dahin ist dieses Paket leer; die Module kommen mit ihren
 * Tests und Kopfkommentaren aus `src/app/` des Erfassungsbogens:
 *
 *   pdf-dokument   pdfmake-Dokumentdefinition (Einzel-PDF, Sammel-PDF, Lageblatt)
 *   bogen-csv, einsatz-csv, csv
 *   oldenburg-xlsx, xlsx
 *   qr-boegen      QR-Texte zu vollständigen Bögen gruppieren
 *   pdf-bilder, pdf-stroeme, pdf-qr
 *   taktische-zeichen-bogen, uebung-wasserzeichen, blanko
 *
 * Importiert wird modulgenau (`@bos/eeb-satz/pdf-dokument`), nicht über diese
 * Fassade. Sie bleibt leer, damit kein Konsument versehentlich alles zieht.
 */
export {};
