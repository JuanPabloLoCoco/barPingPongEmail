import admin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";

import {
  EvtReservationCreated,
  HtmlAndDate,
  ReservationData,
  ReservationRepository,
  ReservationState,
} from "./Reservation.mjs";

import { EmailAddress } from "mailparser";
import { CancelReservation } from "../parseEmail/emailParsing.mjs";
export class FirebaseRepository implements ReservationRepository {
  databaseUrl: string;
  app: admin.app.App | null;
  db: admin.database.Database | null;

  getDb(): admin.database.Database {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  constructor(databaseUrl: string) {
    this.databaseUrl = databaseUrl;
    this.app = null;
    this.db = null;
  }

  async configure() {
    // Configure Firebase
    const firebase_admin_app = admin.initializeApp({
      credential: applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    this.app = firebase_admin_app;
    this.db = this.app.database();

    return;
  }

  async storeMailWithError(props: {
    html: string;
    from: EmailAddress[];
    date: Date;
  }): Promise<void> {
    const db = this.getDb().ref("e");
    const mailRef = db.push();
    await mailRef.set({
      html: props.html,
      date: props.date.getTime(),
      from: props.from,
      type: ReservationState.EMAIL_WITH_ERROR,
      c: new Date().getTime(),
    });
  }
  async storeFailToCreatePassword(
    p: { html: string; date: Date; endDate: Date } & ReservationData
  ): Promise<void> {
    const db = this.getDb().ref("r");
    const mailRef = db.push();
    await mailRef.set({
      html: p.html,
      date: p.date.getTime(),
      endDate: p.endDate.getTime(),
      startDate: p.startDate.getTime(),
      name: p.name,
      phone: p.phone,
      venue: p.venue,
      type: ReservationState.FAIL_TO_CREATE_TOKEN,
      c: new Date().getTime(),
    });
    return;
  }

  async storeFailToNotifyClient(
    p: { token: string; passwordId: string; endDate: Date } & ReservationData &
      HtmlAndDate
  ): Promise<void> {
    const db = this.getDb().ref("r");
    const mailRef = db.push();
    await mailRef.set({
      type: ReservationState.CREATED_WITHOUT_NOTIFY,
      html: p.html,
      date: p.date.getTime(),
      endDate: p.endDate.getTime(),
      startDate: p.startDate.getTime(),
      name: p.name,
      phone: p.phone,
      venue: p.venue,
      token: p.token,
      passwordId: p.passwordId,
    });
  }
  async storeCreatedReservation(p: EvtReservationCreated): Promise<void> {
    const db = this.getDb().ref("r");
    const mailRef = db.push();
    await mailRef.set({
      type: ReservationState.CREATED,
      html: p.html,
      date: p.date.getTime(),
      endDate: p.endDate.getTime(),
      startDate: p.startDate.getTime(),
      name: p.name,
      phone: p.phone,
      venue: p.venue,
      token: p.token,
      passwordId: p.passwordId,
    });
    return;
  }

  async findEmailReservation(
    op: CancelReservation
  ): Promise<(EvtReservationCreated & { id: string }) | null> {
    const snapshot = await this.getDb()
      .ref("r")
      .orderByChild("startDate")
      .equalTo(op.startDate.getTime())
      .once("value");

    if (!snapshot.exists()) {
      return null;
    }

    const response: (EvtReservationCreated & { id: string })[] = [];
    snapshot.forEach((child) => {
      const val = child.val();

      if (
        val.startDate === op.startDate.getTime() &&
        (val.venue as string) === op.venue &&
        (val.name as string) === op.name &&
        (val.phone as string) === op.name
      ) {
        response.push({ ...val, id: child.key as string });
      }
    });

    if (response.length === 0) {
      return null;
    }
    return response[0];
  }
}
