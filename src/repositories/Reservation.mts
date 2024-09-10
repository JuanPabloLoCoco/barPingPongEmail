import { NewReservation } from "../emailParsing.mjs";

export type ReservationType =
  | CreatedReservation
  | ReservationWithToken
  | NotifiedReservation
  | CancelledReservation;

export interface ReservationRepository {
  create(reservation: NewReservation): Promise<CreatedReservation>;
  asignToken(
    reservation: CreatedReservation,
    code: string,
    password_id: string
  ): Promise<ReservationWithToken>;
  notify(reservation: ReservationWithToken): Promise<NotifiedReservation>;
  get(id: string): Promise<ReservationType | null>;
  findReservation(reservation: {
    date: Date;
    venue: string;
    name: string;
  }): Promise<ReservationType | null>;
  getFutureReservations(): Promise<NotifiedReservation[]>;
  cancel(id: string): Promise<CancelledReservation>;
}

export enum ReservationState {
  CREATED = "CREATED",
  WITH_TOKEN = "WITH_TOKEN",
  NOTIFIED = "NOTIFIED",
  CANCELLED = "CANCELLED",
}

interface BaseReservation {
  id: string;
  state: ReservationState;
  reservation: NewReservation;
  errors?: string[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CreatedReservation extends BaseReservation {
  state: ReservationState.CREATED;
}

export interface ReservationWithToken extends BaseReservation {
  state: ReservationState.WITH_TOKEN;
  token: string;
  password_id: string;
}

export interface NotifiedReservation extends BaseReservation {
  state: ReservationState.NOTIFIED;
  token: string;
  password_id: string;
}

export interface CancelledReservation extends BaseReservation {
  state: ReservationState.CANCELLED;
  reservation: NewReservation;
}
