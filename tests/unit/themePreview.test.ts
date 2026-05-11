import { expect } from "chai";
import { shouldRollbackUnsavedTheme } from "/imports/utils/themePreview";

describe("[UNIT] ThemePreview", () => {
  describe("shouldRollbackUnsavedTheme()", () => {
    it("returns true when draft theme differs from baseline theme", () => {
      expect(
        shouldRollbackUnsavedTheme({
          baselineTheme: "corporate",
          draftTheme: "dark",
        }),
      ).to.equal(true);
    });

    it("returns false when draft theme matches baseline theme", () => {
      expect(
        shouldRollbackUnsavedTheme({
          baselineTheme: "pastel",
          draftTheme: "pastel",
        }),
      ).to.equal(false);
    });

    it("returns false when baseline theme is missing", () => {
      expect(
        shouldRollbackUnsavedTheme({
          baselineTheme: null,
          draftTheme: "dark",
        }),
      ).to.equal(false);
    });

    it("returns false when draft theme is missing", () => {
      expect(
        shouldRollbackUnsavedTheme({
          baselineTheme: "default",
          draftTheme: undefined,
        }),
      ).to.equal(false);
    });
  });
});

