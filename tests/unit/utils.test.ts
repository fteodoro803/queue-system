import { expect } from "chai";
import { normaliseString } from "/imports/utils/utils";

describe("[UNIT] Utils", () => {
  describe("normaliseString()", () => {
    it("trims leading and trailing whitespace", () => {
      expect(normaliseString("  taylor ong  ")).to.equal("taylor ong");
    });

    it("converts uppercase and mixed case to lowercase", () => {
      expect(normaliseString("TaYLoR OnG")).to.equal("taylor ong");
    });

    it("returns empty string for whitespace-only input", () => {
      expect(normaliseString("    ")).to.equal("");
    });
  });
});
