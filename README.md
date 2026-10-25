# @bos/eeb-satz

Ausgabe des Einheiten-Erfassungsbogens ohne Oberfläche: PDF-Satz, CSV,
Excel-Liste im Format „Oldenburg", QR-Gruppierung mehrteiliger Bögen, QR aus
PDF-Bildobjekten.

Dieses Repository ist **kein eigenständiges Produkt**, sondern hängt als
git-Submodul unter `vendor/bos-eeb-satz` in zwei Produkten:

- **Erfassungsbogen** (<https://github.com/wattnpapa/erfassungsbogen>): Einzel-PDF, Blanko, CSV und Excel je Bogen
- **Meldekopf** (<https://github.com/wattnpapa/meldekopf>): Sammel-PDF mit Lageblatt, CSV und Excel je Einsatz

Beide binden das Paket über `"@bos/eeb-satz": "file:vendor/bos-eeb-satz"` ein.

> **Stand 2026-10-25:** Gerüst ohne Inhalt. Die Module kommen in Phase 1 der
> Meldekopf-Übernahme aus `src/app/` des Erfassungsbogens hierher, mit Tests
> und Kopfkommentaren. Welche, steht im Übernahmeplan des Meldekopf-Repos
> (`docs/uebernahme-aus-erfassungsbogen.md`, Abschnitt B) und in der Liste
> unten.

## Inhalt (Ziel)

| Modul | Was | Herkunft im Erfassungsbogen |
|---|---|---|
| `pdf-dokument` | pdfmake-Dokumentdefinition: Einzel-PDF, Sammel-PDF, Lageblatt, Probesatz, Kopfzeile je Seite, WinAnsi-Abbildung | `pdf-dokument.ts` |
| `bogen-csv`, `einsatz-csv`, `csv` | CSV-Langformat mit Satzart-Spalte, Übersichts-CSV, Formatgrundlagen (Semikolon, UTF-8-BOM, Dezimalkomma) | gleichnamig |
| `oldenburg-xlsx`, `xlsx` | 38 Spalten der Oldenburger Vorlage, minimaler XLSX-Writer | gleichnamig |
| `qr-boegen` | QR-Texte zu vollständigen Bögen gruppieren | `qr-boegen.ts` |
| `pdf-bilder`, `pdf-stroeme`, `pdf-qr` | QR aus PDF-Bildobjekten lesen, ohne PDF-Renderer | gleichnamig |
| `taktische-zeichen-bogen` | Zeichen aus einem konkreten Bogen auflösen | gleichnamig |
| `uebung-wasserzeichen`, `blanko` | | gleichnamig |

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
(`pdf-seiten.test.ts`, `pdf-dokument.test.ts`) messen mit pdfmake. Ob das
unter `node` ohne DOM läuft, ist zu prüfen; sonst bleiben diese Tests in den
Apps und hier nur die Tests der Dokumentdefinition.

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
Reihenfolge gebaut.

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
