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
// @ts-ignore
import { Low } from "lowdb";
// @ts-ignore
import { JSONFilePreset } from "lowdb/node";

type DbData = Map<string, ReservationType>;

function buildId(date: Date, venue: string, name: string): string {
  return `${date.getTime()}_${venue}_${name}`;
}

export class LowDBRepository implements ReservationRepository {
  #db: Low<DbData> | null = null;
  #env: string;

  constructor(env: "test" | "prod") {
    this.#env = env;
  }

  #getDb(): Low<DbData> {
    if (!this.#db) {
      throw new Error("DB not configured");
    }
    return this.#db;
  }

  async config() {
    const db = await JSONFilePreset(
      `reservations_${this.#env}.json`,
      new Map()
    );
    this.#db = db;
    db.read();
    // this.#env === "test"
    //   ? new Memory<DbData>()
    //   : new JSONFilePreset<DbData>(`reservations_${this.#env}.json`);
  }

  async create(reservation: NewReservation): Promise<CreatedReservation> {
    const db = this.#getDb();
    const createdReservation: CreatedReservation = {
      id: buildId(reservation.startDate, reservation.venue, reservation.name),
      state: ReservationState.CREATED,
      reservation,
      createdAt: new Date(),
      updatedAt: null,
    };
    this.#db?.data.set(createdReservation.id, createdReservation);
    await this.#db?.write();
    return createdReservation;
  }
  async asignToken(
    reservation: CreatedReservation,
    code: string,
    password_id: string
  ): Promise<ReservationWithToken> {
    const db = this.#getDb();
    const reservationWithToken: ReservationWithToken = {
      ...reservation,
      state: ReservationState.WITH_TOKEN,
      token: code,
      password_id,
    };
    db.data.set(reservationWithToken.id, reservationWithToken);
    await db.write();
    return reservationWithToken;
  }
  async get(id: string): Promise<ReservationType | null> {
    const db = this.#getDb();

    await db.read();
    const reservationFound = db.data.get(id);
    if (!reservationFound) {
      throw new Error("Reservation not found");
    }
    return reservationFound;
  }

  async findReservation(reservation: {
    date: Date;
    venue: string;
    name: string;
  }): Promise<ReservationType | null> {
    const db = this.#getDb();
    await db.read();
    const id = buildId(reservation.date, reservation.venue, reservation.name);
    const reservationFound = db.data.get(id);
    return reservationFound ?? null;
  }
  async cancel(id: string): Promise<CancelledReservation> {
    const db = this.#getDb();
    const reservationFound = db.data.get(id);
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
    db.data.set(id, cancelledReservation);
    await db.write();
    return cancelledReservation;
  }
  getFutureReservations(): Promise<NotifiedReservation[]> {
    const db = this.#getDb();
    const today = new Date().getTime();
    const reservationArray = Array.from(db.data.values());

    return Promise.resolve(
      reservationArray.filter(
        (x) =>
          x.state === ReservationState.NOTIFIED &&
          x.reservation.startDate.getTime() >= today
      ) as NotifiedReservation[]
    );
  }
  async notify(
    reservation: ReservationWithToken
  ): Promise<NotifiedReservation> {
    const db = this.#getDb();
    const notifiedReservation: NotifiedReservation = {
      ...reservation,
      state: ReservationState.NOTIFIED,
    };
    db.data.set(notifiedReservation.id, notifiedReservation);
    await db.write();
    return notifiedReservation;
  }
}
