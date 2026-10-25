# @bos/eeb-satz

Ausgabe des Einheiten-Erfassungsbogens ohne Oberfläche: PDF-Satz, CSV,
Excel-Liste im Format „Oldenburg", QR-Gruppierung mehrteiliger Bögen, QR aus
PDF-Bildobjekten.

Dieses Repository ist **kein eigenständiges Produkt**, sondern hängt als
git-Submodul unter `vendor/bos-eeb-satz` in zwei Produkten:

- **Erfassungsbogen** (<https://github.com/wattnpapa/erfassungsbogen>): Einzel-PDF, Blanko, CSV und Excel je Bogen
- **Meldekopf** (<https://github.com/wattnpapa/meldekopf>): Sammel-PDF mit Lageblatt, CSV und Excel je Einsatz

Beide binden das Paket über `"@bos/eeb-satz": "file:vendor/bos-eeb-satz"` ein.

> **Stand 2026-10-25:** Erste Stufe übernommen aus `src/app/` des
> Erfassungsbogens (Commit `441811c`): die Module, die ohne App-Code
> auskommen. Die übrigen hängen im Erfassungsbogen noch an App-Modulen mit
> `localStorage`, DOM oder Capacitor (`hilfen`, `eintrag-zeiten`,
> `export-stand`, `fassung-vorrang`, `auswertung`, `einheiten-tabelle`,
> `org-farben`, `qr-stapel`, `qr-decoder`). Unverändert hierher verschoben,
> verletzten sie Regel 2 und 3. Sie folgen, sobald die Meldekopf-App diese
> Module übernommen hat und feststeht, welcher reine Teil davon mit in den
> Kern geht oder hineingereicht wird (Spalte Stand).

## Inhalt

| Modul | Was | Stand |
|---|---|---|
| `csv` | Formatgrundlagen: Semikolon, UTF-8-BOM, Dezimalkomma, Formel-Schutz | übernommen |
| `xlsx` | minimaler XLSX-Schreiber (ADR-001 des Erfassungsbogens) | übernommen |
| `pdf-stroeme`, `pdf-bilder` | Ströme und Bildobjekte einer PDF roh lesen, ohne Renderer (ADR-006 des Erfassungsbogens) | übernommen |
| `taktische-zeichen-bogen` | Zeichen aus einem konkreten Bogen auflösen | übernommen |
| `uebung-wasserzeichen` | Wasserzeichen „ÜBUNG" | übernommen |
| `pdf-qr` | QR-Texte aus PDF-Bildern; braucht den QR-Decoder der App (zxing-wasm), wird hineingereicht | offen |
| `qr-boegen` | QR-Texte zu vollständigen Bögen gruppieren; hängt an `qr-stapel` der App | offen |
| `pdf-dokument`, `blanko` | pdfmake-Dokumentdefinition: Einzel-PDF, Sammel-PDF, Lageblatt, Probesatz, Kopfzeile je Seite, WinAnsi-Abbildung; hängt an `auswertung`, `einheiten-tabelle`, `eintrag-zeiten`, `hilfen`, `org-farben` | offen |
| `bogen-csv`, `einsatz-csv` | CSV-Langformat mit Satzart-Spalte, Übersichts-CSV; hängen zusätzlich an `export-stand`, `fassung-vorrang` | offen |
| `oldenburg-xlsx` | 38 Spalten der Oldenburger Vorlage; wie die CSV | offen |

**Nicht hier:** QR-Bild erzeugen, PDF rendern, Download, Vorschau. Das ist
plattformabhängig und bleibt in den Apps (`pdf.ts`). Dieser Baustein baut die
Dokumentdefinition; pdfmake kommt nur als Typquelle vor (`@types/pdfmake`).

Importiert wird **modulgenau** (`@bos/eeb-satz/pdf-dokument`), nicht über
den Sammel-Einstieg; der bleibt leer.

## Aufnahmeregeln (ADR-003 des Erfassungsbogens, ADR-005 des Meldekopfs)

1. Aufnahme nur, wenn beide Produkte den Baustein aufrufen.
2. Keine `node:`-, DOM- oder React-Importe; geprüft per ESLint und durch Testlauf unter `node` und `jsdom`.
3. Keine Rückimporte aus `@s1/*`, aus der Erfassungsbogen-App oder der Meldekopf-App.
4. Änderungen additiv; das Papier-Layout folgt den amtlichen Bögen, Änderungen daran sind im Commit zu begründen.
5. Bundle-Budget im CI beider Apps; der Baustein darf die PWAs nicht schwerer machen.
6. Gepinnte Submodul-Commits; kein automatisches Folgen von `main`.

Regel 2 und 3 sind maschinell hinterlegt: `eslint.config.mjs` verbietet die
Importe, `tsconfig.json` lässt `"DOM"` aus `lib` und setzt `"types": []`,
`vitest.config.ts` fährt dieselben Testdateien unter `node` und unter `jsdom`.

Offen beim Übernehmen von `pdf-dokument`: Die Tests mit echtem Satz
(`pdf-seiten.test.ts`, `pdf-papier-r5.test.ts`, `pdf-winansi.test.ts`)
messen mit pdfmake. Im Erfassungsbogen laufen sie schon heute im
Vitest-Projekt `logik` unter `node` (Stand `441811c`); hier müssen sie
zusätzlich unter `jsdom` laufen. Geht das nicht, steht der Rückweg in
ADR-005 der Meldekopf-App (Satz in beiden Apps mit gemeinsamer Testfixture).

`pako` ist wie die Kern-Bausteine `peerDependency`: `xlsx` packt damit,
`pdf-stroeme` entpackt; die Apps bringen pako ohnehin mit. Ein Global ist
von Hand deklariert (`src/plattform.d.ts`: `TextEncoder`), nach dem Vorbild
von `@bos/meldekopf`.

## Warum die Kern-Bausteine peerDependencies sind

`@bos/eeb-format`, `@bos/meldekopf`, `@bos/vokabulare` und
`@bos/taktische-zeichen` sind `peerDependency`, nicht `dependency`. Läge das
Format ein zweites Mal im Baum, sähe TypeScript zwei verschiedene Typen
gleichen Namens (ADR-003, Nachtrag „Diamant auf eeb-format"). Das Produkt
liefert die eine Kopie. Zur Entwicklung hier sind sie zusätzlich als
`devDependency` auf `file:../…` verdrahtet.

## Lokal bauen und prüfen

Voraussetzung: Node 24 (siehe `.nvmrc`), `eeb-format`, `bos-vokabulare`,
`bos-taktische-zeichen` und `bos-meldekopf` als Nachbarordner, in dieser
Reihenfolge gebaut. Die CI checkt sie dafür gepinnt neben diesem Repo aus
(dieselben Commits wie in den Apps).

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm test
```

Kein `prepare`-Skript, aus denselben Gründen wie bei den anderen
Kern-Bausteinen (ADR-003a des Erfassungsbogens).

## Lizenz

EUPL-1.2
