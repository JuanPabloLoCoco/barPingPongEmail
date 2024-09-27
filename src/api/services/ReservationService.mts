import { generateSevenDigitString } from "../common/generateSevenDigitString.mjs";
import { authorize } from "../gmail/auth.mjs";
import {
  EmailOperation,
  emailParsing,
  ReservationType,
} from "../parseEmail/emailParsing.mjs";
// import { createDynamicKeyPassword } from "../../functions/tuyaFns.mjs";
// import { generateSevenDigitString } from "../../functions/utils.mjs";
// import { ReservationType } from "../parseEmail/emailParsing.mjs";
import {
  EvtReservationCreated,
  ReservationRepository,
  ReservationState,
} from "../repositories/Reservation.mjs";
import { EmailData, proccessMessages } from "../routes/messageRoutes.mjs";
import { createDynamicKeyPassword } from "../tuya/index.mjs";
import { SMSService } from "./SMSService.mjs";

function generateName(venue: string, name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return `${venue}-${initials}`.slice(0, 10);
}

export class ReservationService {
  reservationRepository: ReservationRepository;
  smsService: SMSService;
  constructor(
    reservationRepository: ReservationRepository,
    smsService: SMSService
  ) {
    this.reservationRepository = reservationRepository;
    this.smsService = smsService;
  }

  async readEmails(): Promise<void> {
    try {
      const authenticated = await authorize();
      if (!authenticated) {
        console.log(
          `[${new Date()}] Not authenticated. Try to configure Gmail email`
        );
        return;
      }
    } catch (err) {
      console.error(`[${new Date()}] Error authorizing gmail apps ${err}`);
      return;
    }

    console.log(`[${new Date()}] Reading emails...`);
    const emailList = await proccessMessages();

    if (emailList.length === 0) {
      console.log(`[${new Date()}] No new emails found`);
      return;
    }

    const listOfOperations: { op: EmailOperation; e: EmailData }[] = [];
    for (const email of emailList) {
      try {
        const evt = emailParsing(email.html, email.date);
        if (evt) {
          listOfOperations.push({ op: evt, e: email });
        }
      } catch (err) {
        this.reservationRepository.storeMailWithError(email);
        console.error(`[${new Date()}] Error parsing email ${err}`);
      }
    }

    // TODO: Match creation operations with cancel operations in the same time and venue

    for (const operation of listOfOperations) {
      if (operation.op.type === ReservationType.CANCEL) {
        const found = await this.reservationRepository.findEmailReservation(
          operation.op
        );

        if (!found) {
          console.log(
            `[${new Date()}] Cancel for reservation ${operation.op.name} - ${
              operation.op.startDate
            } - ${operation.op.venue} not found`
          );
          continue;
        }

        // As is found - try to delete created password

        // Try to delete password

        // Mark reservation as deleted

        // this.reservationRepository.cancel(found.id);
        // console.log(
        //   `[${new Date()}] Reservation cancelled: ${found.id} - Date: ${
        //     found.reservation.startDate
        //   } - Venue: ${found.reservation.venue} - Name: ${
        //     found.reservation.name
        //   } - Venue: ${found.reservation.venue}`
        // );
        continue;
      }

      // Generate token to reservation
      const keyCode = generateSevenDigitString();
      let password_id: string = "";
      const startDateSeconds = operation.op.startDate.getTime() / 1000;
      const endDateSeconds = startDateSeconds + 2 * 60 * 60; // 2 hours
      const startDate = operation.op.startDate;
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      try {
        // Times should be sent in seconds
        const dinamicPassRes = await createDynamicKeyPassword(
          generateName(operation.op.venue, operation.op.name),
          keyCode,
          startDate,
          endDate
        );

        if ("error" in dinamicPassRes) {
          console.error(
            `[${new Date()}] Error creating password: ${
              dinamicPassRes.error.message
            }`
          );

          await this.reservationRepository.storeFailToCreatePassword({
            date: operation.e.date,
            endDate: new Date(endDateSeconds * 1000),
            startDate: operation.op.startDate,
            html: operation.e.html,
            name: operation.op.name,
            phone: operation.op.phone,
            venue: operation.op.venue,
          });

          continue;
        }
        password_id = `${dinamicPassRes.password_id}`;
      } catch (error) {
        console.error(
          `[${new Date()}] Error creating password: ${(error as Error).message}`
        );
        // Unable to create password in Tuya
        await this.reservationRepository.storeFailToCreatePassword({
          date: operation.e.date,
          endDate: new Date(endDateSeconds),
          startDate: operation.op.startDate,
          html: operation.e.html,
          name: operation.op.name,
          phone: operation.op.phone,
          venue: operation.op.venue,
        });
        continue;
      }

      // Send SMS with token
      const dataToStore: EvtReservationCreated = {
        date: operation.e.date,
        endDate: new Date(endDateSeconds),
        startDate: operation.op.startDate,
        html: operation.e.html,
        name: operation.op.name,
        phone: operation.op.phone,
        venue: operation.op.venue,
        token: keyCode,
        passwordId: password_id,
      };
      try {
        const error = await this.smsService.sendMessage(
          operation.op.phone,
          generateReservationMessage(
            operation.op.name,
            operation.op.startDate,
            keyCode,
            operation.op.venue
          )
        );
        if (error) {
          await this.reservationRepository.storeFailToNotifyClient(dataToStore);
          continue;
        }

        await this.reservationRepository.storeCreatedReservation(dataToStore);
      } catch (error) {
        await this.reservationRepository.storeFailToNotifyClient(dataToStore);
      }
    }
  }
}

function generateReservationMessage(
  name: string,
  date: Date,
  token: string,
  venue: string
) {
  const formatoFecha = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return `Hola ${name}! \n
  Tu código de reserva para jugar en ${venue} de Bar ping Pong el ${formatoFecha} es ${token}#`;
}
