/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import {
  formatNumberDisplay,
  isPhilippineNumber,
} from "/imports/utils/numberUtils";

describe("[UNIT] NumberUtils", () => {
  describe("formatNumberDisplay()", () => {
    it("returns an empty string for empty input", () => {
      expect(formatNumberDisplay("")).to.equal("");
      expect(formatNumberDisplay("   ")).to.equal("");
    });

    describe("when input starts with +63", () => {
      it("formats values as +63 + 3 + 3 + remaining", () => {
        expect(formatNumberDisplay("+639991234567")).to.equal(
          "+63 999 123 4567",
        );
        expect(formatNumberDisplay("+63 999-123-4567")).to.equal(
          "+63 999 123 4567",
        );
      });

      it("supports partial +63 input", () => {
        expect(formatNumberDisplay("+")).to.equal("+");
        expect(formatNumberDisplay("+6")).to.equal("+6");
        expect(formatNumberDisplay("+63")).to.equal("+63");
        expect(formatNumberDisplay("+639")).to.equal("+63 9");
      });

      it("is idempotent for already formatted +63 values", () => {
        expect(formatNumberDisplay("+63 999 123 4567")).to.equal(
          "+63 999 123 4567",
        );
      });
    });

    describe("when input starts with 63", () => {
      it("formats values as 63 + 3 + 3 + remaining", () => {
        expect(formatNumberDisplay("639991234567")).to.equal("63 999 123 4567");
        expect(formatNumberDisplay("63 999 123 4567")).to.equal(
          "63 999 123 4567",
        );
      });

      it("supports partial 63 input", () => {
        expect(formatNumberDisplay("63")).to.equal("63");
        expect(formatNumberDisplay("639")).to.equal("63 9");
        expect(formatNumberDisplay("63999")).to.equal("63 999");
      });
    });

    describe("when input starts with 0", () => {
      it("keeps short inputs (up to 4 digits) ungrouped", () => {
        expect(formatNumberDisplay("09")).to.equal("09");
        expect(formatNumberDisplay("0917")).to.equal("0917");
      });

      it("groups values with 5 to 7 digits as 4 + remaining", () => {
        expect(formatNumberDisplay("09171")).to.equal("0917 1");
        expect(formatNumberDisplay("0917123")).to.equal("0917 123");
      });

      it("groups values with 8 to 11 digits as 4 + 3 + remaining", () => {
        expect(formatNumberDisplay("09171234")).to.equal("0917 123 4");
        expect(formatNumberDisplay("09171234567")).to.equal("0917 123 4567");
      });

      it("strips non-digit characters before formatting", () => {
        expect(formatNumberDisplay("0917-123-4567")).to.equal("0917 123 4567");
        expect(formatNumberDisplay("09a17 12b3-45c67")).to.equal(
          "0917 123 4567",
        );
      });

      it("caps output to the first 11 digits", () => {
        expect(formatNumberDisplay("09171234567890")).to.equal("0917 123 4567");
      });

      it("keeps local formatting behavior", () => {
        expect(formatNumberDisplay("09991234567")).to.equal("0999 123 4567");
        expect(formatNumberDisplay("0917-123-4567")).to.equal("0917 123 4567");
      });
    });
  });

  describe("isPhilippineNumber()", () => {
    describe("when input starts with +63", () => {
      it("accepts valid +639 numbers", () => {
        expect(isPhilippineNumber("+639991234567")).to.equal(true);
        expect(isPhilippineNumber("+63 999 123 4567")).to.equal(true);
      });

      it("rejects invalid +63 inputs", () => {
        expect(isPhilippineNumber("+638991234567")).to.equal(false);
        expect(isPhilippineNumber("+63999123456")).to.equal(false);
        expect(isPhilippineNumber("+6399912345678")).to.equal(false);
      });
    });

    describe("when input starts with 63", () => {
      it("accepts valid 639 numbers", () => {
        expect(isPhilippineNumber("639991234567")).to.equal(true);
        expect(isPhilippineNumber("63 999 123 4567")).to.equal(true);
      });

      it("rejects invalid 63 inputs", () => {
        expect(isPhilippineNumber("638991234567")).to.equal(false);
        expect(isPhilippineNumber("63999123456")).to.equal(false);
        expect(isPhilippineNumber("6399912345678")).to.equal(false);
      });
    });

    describe("when input starts with 0", () => {
      it("accepts valid 09 numbers", () => {
        expect(isPhilippineNumber("09991234567")).to.equal(true);
        expect(isPhilippineNumber("0999 123 4567")).to.equal(true);
      });

      it("rejects invalid 0-prefixed inputs", () => {
        expect(isPhilippineNumber("08991234567")).to.equal(false);
        expect(isPhilippineNumber("0999123456")).to.equal(false);
        expect(isPhilippineNumber("099912345678")).to.equal(false);
      });
    });

    it("rejects empty and non-numeric-like values", () => {
      expect(isPhilippineNumber("")).to.equal(false);
      expect(isPhilippineNumber("   ")).to.equal(false);
      expect(isPhilippineNumber("abcdefg")).to.equal(false);
    });
  });
});
