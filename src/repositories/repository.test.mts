import { describe, test, expect } from "@jest/globals";
// import lowdb from "lowdb";
// import { LowDBRepository } from "./LowDBRepository";
// import { NewReservation, ReservationType } from "../emailParsing";

import { NewReservation, ReservationType } from "../emailParsing.mjs";
import { LocalReservationRepository } from "./LocalRepository.mjs";

// jest.mock("lowdb");

// describe("LowDbRepository test", () => {
//   let repository: LowDBRepository;
//   let mockDb: any;

//   beforeEach(() => {
//     mockDb = {
//       get: jest.fn().mockReturnThis(),
//       find: jest.fn().mockReturnThis(),
//       value: jest.fn(),
//       push: jest.fn().mockReturnThis(),
//       write: jest.fn(),
//       defaults: jest.fn().mockReturnThis(),
//     };

//     (lowdb as unknown as jest.Mock).mockReturnValue(mockDb);
//     repository = new LowDBRepository("test");
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test("Should create a reservation", async () => {
//     const reservation: NewReservation = {
//       startDate: new Date(),
//       venue: "venue",
//       name: "name",
//       type: ReservationType.NEW,
//       endDate: new Date(),
//       phone: "+5491140405050",
//     };

//     await repository.create(reservation);

//     expect(mockDb.push).toHaveBeenCalledWith({
//       id: expect.any(String),
//       state: "CREATED",
//       reservation,
//       createdAt: expect.any(Date),
//       updatedAt: null,
//     });
//     expect(mockDb.write).toHaveBeenCalled();
//   });
// });

describe("LocalRepository test", () => {
  test("Should create a reservation", async () => {
    const repository = new LocalReservationRepository();
    const reservation: NewReservation = {
      startDate: new Date(),
      venue: "venue",
      name: "name",
      type: ReservationType.NEW,
      endDate: new Date(),
      phone: "+5491140405050",
    };

    const createdReservation = await repository.create(reservation);

    expect(createdReservation).toMatchSnapshot({
      id: expect.any(String),
      state: "CREATED",
      reservation,
      createdAt: expect.any(Date),
      updatedAt: null,
    });

    // Get reservation
    const reservationFound = await repository.get(createdReservation.id);
    expect(reservationFound).toEqual(createdReservation);
  });
});
