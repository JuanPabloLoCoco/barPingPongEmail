import admin, { ServiceAccount } from "firebase-admin";
import { resolve } from "path";
import {
  EvtReservationCreated,
  HtmlAndDate,
  ReservationData,
  ReservationRepository,
  ReservationState,
} from "./Reservation.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { EmailAddress } from "mailparser";
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

  configure(): void {
    // Configure Firebase

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const path = resolve(__dirname, "../../../firebase-config.json");

    this.app = admin.initializeApp({
      credential: admin.credential.cert(path as ServiceAccount),
      databaseURL: this.databaseUrl,
    });
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
}
