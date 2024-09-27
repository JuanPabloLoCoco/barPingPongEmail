import { EmailAddress } from "mailparser";
import { EmailData } from "../routes/messageRoutes.mjs";
import { CancelReservation } from "../parseEmail/emailParsing.mjs";

export interface EmailDataWithId extends EmailData {
  id: string;
}
export interface ReservationRepository {
  findEmailReservation(op: CancelReservation): unknown;
  storeCreatedReservation(p: EvtReservationCreated): Promise<void>;
  storeFailToNotifyClient(p: EvtReservationCreated): Promise<void>;
  storeFailToCreatePassword(p: EvtFailToCreatePassword): Promise<void>;
  storeMailWithError(props: EvtMailWithError): Promise<void>;
}

export interface EvtMailWithError {
  html: string;
  from: EmailAddress[];
  date: Date;
}

export interface EvtFailToCreatePassword {
  html: string;
  date: Date;
  name: string;
  phone: string;
  venue: string;
  startDate: Date;
  endDate: Date;
}

export interface EvtReservationCreated {
  html: string;
  date: Date;
  name: string;
  phone: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  token: string;
  passwordId: string;
}

export interface ReservationData {
  name: string;
  phone: string;
  venue: string;
  startDate: Date;
}

export interface HtmlAndDate {
  html: string;
  date: Date;
}

export enum ReservationState {
  EMAIL_WITH_ERROR = "EMAIL_WITH_ERROR",
  FAIL_TO_CREATE_TOKEN = "FAIL_TO_CREATE_TOKEN",
  CREATED_WITHOUT_NOTIFY = "CREATED_WITHOUT_NOTIFY",
  CREATED = "CREATED",
  FAIL_TO_CANCEL = "FAIL_TO_CANCEL",
  CANCELLED = "CANCELLED",
  CREATED_AND_CANCELLED = "CREATED_AND_CANCELLED",
}
