import { ReservationRepository } from "./Reservation";
import admin, { ServiceAccount } from "firebase-admin";
import { resolve } from "path";
import { EmailData } from "../routes/messagesRoutes";

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

    const path = resolve(__dirname, "../../../firebase-config.json");

    this.app = admin.initializeApp({
      credential: admin.credential.cert(path as ServiceAccount),
      databaseURL: this.databaseUrl,
    });
    this.db = this.app.database();
    return;
  }

  async storeMails(mails: EmailData[]): Promise<void> {
    const db = this.getDb().ref("m");

    for (const mail of mails) {
      const mailRef = db.push();
      await mailRef.set(mail);
    }

    return;
  }

  async getReservation(id: string): Promise<any> {
    const db = this.getDb().ref("r");
    const reservationRef = db.push(id);
    // const doc = await reservationRef.get();
    // if (!doc.exists) {
    //   throw new Error("No such reservation!");
    // }
    // return doc.data();
  }

  async createReservation(data: any): Promise<void> {
    // const reservationRef = this.getDb().collection("reservations").doc();
    // await reservationRef.set(data);
  }

  async updateReservation(id: string, data: any): Promise<void> {
    // const reservationRef = this.getDb().collection("reservations").doc(id);
    // await reservationRef.update(data);
  }

  async deleteReservation(id: string): Promise<void> {
    // const reservationRef = this.getDb().collection("reservations").doc(id);
    // await reservationRef.delete();
  }
}
