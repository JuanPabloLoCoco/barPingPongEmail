import { NewReservation } from "../emailParsing";
import {
  CancelledReservation,
  CreatedReservation,
  NotifiedReservation,
  ReservationRepository,
  ReservationState,
  ReservationType,
  ReservationWithToken,
} from "./Reservation";

export class LocalReservationRepository implements ReservationRepository {
  private idMap: Map<string, ReservationType> = new Map();

  constructor() {
    this.idMap = new Map();
  }

  create(reservation: NewReservation): CreatedReservation {
    const createdReservation: CreatedReservation = {
      id: `${reservation.startDate.getTime()}_${reservation.venue}_${
        reservation.name
      }`,
      state: ReservationState.CREATED,
      reservation,
      createdAt: new Date(),
      updatedAt: null,
    };
    this.idMap.set(createdReservation.id, createdReservation);
    return createdReservation;
  }
  asignToken(
    reservation: CreatedReservation,
    newToken: string
  ): ReservationWithToken {
    const reservationWithToken: ReservationWithToken = {
      ...reservation,
      state: ReservationState.WITH_TOKEN,
      token: newToken,
    };
    this.idMap.set(reservationWithToken.id, reservationWithToken);
    return reservationWithToken;
  }
  get(
    id: string
  ):
    | CreatedReservation
    | ReservationWithToken
    | NotifiedReservation
    | CancelledReservation
    | null {
    const reservationFound = this.idMap.get(id);
    if (!reservationFound) {
      throw new Error("Reservation not found");
    }
    return reservationFound;
  }
  cancel(id: string): CancelledReservation {
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
    return cancelledReservation;
  }
  getFutureReservations(): NotifiedReservation[] {
    const today = new Date().getTime();
    const reservationArray = Array.from(this.idMap.values());

    return reservationArray.filter(
      (x) =>
        x.state === ReservationState.NOTIFIED &&
        x.reservation.startDate.getTime() >= today
    ) as NotifiedReservation[];
  }
  notify(reservation: ReservationWithToken): NotifiedReservation {
    const notifiedReservation: NotifiedReservation = {
      ...reservation,
      state: ReservationState.NOTIFIED,
    };
    this.idMap.set(notifiedReservation.id, notifiedReservation);
    return notifiedReservation;
  }
}
