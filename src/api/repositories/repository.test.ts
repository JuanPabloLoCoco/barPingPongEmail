import { describe, test, expect } from "@jest/globals";
import { LocalReservationRepository } from "./LocalRepository";
import { NewReservation, ReservationType } from "../parseEmail/emailParsing";

describe("LocalRepository test", () => {
  test("Happy case", async () => {
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

    // Add token to reservation
    const token = "1234567";

    const reservationWithToken = await repository.asignToken(
      createdReservation,
      token,
      token
    );
    expect(reservationWithToken).toMatchSnapshot({
      ...reservationWithToken,
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const notifyReservation = await repository.notify(reservationWithToken);
    expect(notifyReservation).toMatchSnapshot({
      ...notifyReservation,
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const cancelReservation = await repository.cancel(notifyReservation.id);
    expect(cancelReservation).toMatchSnapshot({
      ...cancelReservation,
      state: "CANCELLED",
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
