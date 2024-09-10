import { NewReservation } from "../emailParsing.mjs";
import {
  CancelledReservation,
  CreatedReservation,
  NotifiedReservation,
  ReservationRepository,
  ReservationState,
  ReservationType,
  ReservationWithToken,
} from "./Reservation.mjs";

function buildId(date: Date, venue: string, name: string): string {
  return `${date.getTime()}_${venue}_${name}`;
}
export class LocalReservationRepository implements ReservationRepository {
  idMap: Map<string, ReservationType> = new Map();

  create(reservation: NewReservation): Promise<CreatedReservation> {
    const createdReservation: CreatedReservation = {
      id: buildId(reservation.startDate, reservation.venue, reservation.name),
      state: ReservationState.CREATED,
      reservation,
      createdAt: new Date(),
      updatedAt: null,
    };
    this.idMap.set(createdReservation.id, createdReservation);
    return Promise.resolve(createdReservation);
  }
  asignToken(
    reservation: CreatedReservation,
    token: string,
    password_id: string
  ): Promise<ReservationWithToken> {
    const reservationWithToken: ReservationWithToken = {
      ...reservation,
      state: ReservationState.WITH_TOKEN,
      token,
      password_id,
    };
    this.idMap.set(reservationWithToken.id, reservationWithToken);
    return Promise.resolve(reservationWithToken);
  }
  get(id: string): Promise<ReservationType | null> {
    const reservationFound = this.idMap.get(id);
    if (!reservationFound) {
      throw new Error("Reservation not found");
    }
    return Promise.resolve(reservationFound);
  }
  findReservation(reservation: {
    date: Date;
    venue: string;
    name: string;
  }): Promise<ReservationType | null> {
    const id = buildId(reservation.date, reservation.venue, reservation.name);
    const reservationFound = this.idMap.get(id);
    return Promise.resolve(reservationFound ?? null);
  }
  cancel(id: string): Promise<CancelledReservation> {
    const reservationFound = this.idMap.get(id);
    if (
      !reservationFound ||
      reservationFound.state === ReservationState.CANCELLED
    ) {
      throw new Error("Reservation not found");
    }
    const cancelledReservation: CancelledReservation = {
      id: reservationFound.id,
      state: ReservationState.CANCELLED,
      reservation: reservationFound.reservation,
      createdAt: reservationFound.createdAt,
      updatedAt: new Date(),
    };
    this.idMap.set(id, cancelledReservation);
    return Promise.resolve(cancelledReservation);
  }
  getFutureReservations(): Promise<NotifiedReservation[]> {
    const today = new Date().getTime();
    const reservationArray = Array.from(this.idMap.values());

    return Promise.resolve(
      reservationArray.filter(
        (x) =>
          x.state === ReservationState.NOTIFIED &&
          x.reservation.startDate.getTime() >= today
      ) as NotifiedReservation[]
    );
  }
  notify(reservation: ReservationWithToken): Promise<NotifiedReservation> {
    const notifiedReservation: NotifiedReservation = {
      ...reservation,
      state: ReservationState.NOTIFIED,
    };
    this.idMap.set(notifiedReservation.id, notifiedReservation);
    return Promise.resolve(notifiedReservation);
  }
}
