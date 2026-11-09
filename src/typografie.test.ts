/** Herkunft: Erfassungsbogen `src/app/typografie.ts` (Commit 1d7ed5f), reiner Teil. */
import { describe, expect, it } from "vitest";
import { anfuehrung } from "./typografie";

describe("anfuehrung()", () => {
  it("schließt ein offenes „ mit “ statt mit dem geraden Zeichen", () => {
    expect(anfuehrung('„Name"')).toBe("„Name“");
    expect(anfuehrung("„Name“ bleibt")).toBe("„Name“ bleibt");
    expect(anfuehrung('ohne "Anführung"')).toBe('ohne "Anführung"');
  });
});
