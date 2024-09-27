import { describe, test, expect } from "@jest/globals";
import {
  ErrorMessages,
  parsingDate,
  getDateAndTimeFromString,
} from "./parseDateTime.mjs";

describe("Parse date time - fn separar fecha hora", () => {
  const ex1 = "Saturday 29 de June a las 13:00";
  const ex2 = "Tuesday 02 de July a las 20:00";

  describe("FN - separarFechaHora", () => {
    test("Valid date time", () => {
      expect(getDateAndTimeFromString(ex1)).toEqual({
        diaSemana: "Saturday",
        dia: 29,
        mes: 6,
        hora: "13:00",
      });
      expect(getDateAndTimeFromString(ex2)).toEqual({
        diaSemana: "Tuesday",
        dia: 2,
        mes: 7,
        hora: "20:00",
      });
    });

    test("Invalid date time", () => {
      expect(() => getDateAndTimeFromString("29 de June a las 13:00")).toThrow(
        ErrorMessages.INVALID_DAY_OF_THE_WEEK
      );

      expect(() =>
        getDateAndTimeFromString("sabado 29 de June a las 13:00")
      ).toThrow(ErrorMessages.INVALID_DAY_OF_THE_WEEK);

      expect(() => getDateAndTimeFromString("Saturday 29 June 13:00")).toThrow(
        new Error(ErrorMessages.INVALID_DAY_NUMBER)
      );

      expect(() =>
        getDateAndTimeFromString("Saturday 29 June a las 13:00")
      ).toThrow(new Error(ErrorMessages.INVALID_DAY_NUMBER));

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June 13:00")
      ).toThrow(new Error(ErrorMessages.INVALID_MONTH));

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June a 13:00")
      ).toThrow(new Error(ErrorMessages.INVALID_MONTH));

      expect(() => getDateAndTimeFromString("Saturday 29 de June las")).toThrow(
        new Error(ErrorMessages.INVALID_MONTH)
      );

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June a las")
      ).toThrow(new Error(ErrorMessages.INVALID_MONTH));

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June a las ")
      ).toThrow(new Error(ErrorMessages.INVALID_TIME));

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June a las 1:00")
      ).toThrow(new Error(ErrorMessages.INVALID_TIME));

      expect(() =>
        getDateAndTimeFromString("Saturday 29 de June a las 01:0")
      ).toThrow(new Error(ErrorMessages.INVALID_TIME));
    });
  });

  describe("Parse date time - fn parsingDate", () => {
    test("Valid date time - ex1", () => {
      const parsed = parsingDate(ex1, new Date(Date.UTC(2024, 0, 1)));
      expect(parsed).toEqual(new Date(Date.UTC(2024, 5, 29, 16, 0)));
    });

    test("Valid date time - ex2", () => {
      const parsed = parsingDate(ex2, new Date(Date.UTC(2024, 0, 1)));
      expect(parsed).toEqual(new Date(Date.UTC(2024, 6, 2, 23, 0)));
    });
  });
});
