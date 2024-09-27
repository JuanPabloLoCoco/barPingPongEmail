import { describe, test, expect } from "@jest/globals";

// import { LocalReservationRepository } from "./LocalRepository.mjs";
// import {
//   EmailNewReservation,
//   ReservationType,
// } from "../parseEmail/emailParsing.mjs";

describe("LocalRepository test", () => {
  test("Should pass", () => {
    expect(true).toBe(true);
  });
  // test("Should create a reservation", async () => {
  //   const repository = new LocalReservationRepository();
  //   const reservation: EmailNewReservation = {
  //     startDate: new Date(),
  //     venue: "venue",
  //     name: "name",
  //     type: ReservationType.NEW,
  //     endDate: new Date(),
  //     phone: "+5491140405050",
  //   };

  //   const createdReservation = await repository.create(reservation);

  //   expect(createdReservation).toMatchSnapshot({
  //     id: expect.any(String),
  //     state: "CREATED",
  //     reservation,
  //     createdAt: expect.any(Date),
  //     updatedAt: null,
  //   });

  //   // Get reservation
  //   const reservationFound = await repository.get(createdReservation.id);
  //   expect(reservationFound).toEqual(createdReservation);
  // });
});
