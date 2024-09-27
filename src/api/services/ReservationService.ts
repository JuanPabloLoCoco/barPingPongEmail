import { authorize } from "../../functions/gmail-auth.mjs";
import { createDynamicKeyPassword } from "../../functions/tuyaFns.mjs";
import { generateSevenDigitString } from "../../functions/utils.mjs";
import { ReservationType } from "../parseEmail/emailParsing.mjs";
import {
  ReservationRepository,
  ReservationState,
} from "../repositories/Reservation.mjs";
import { proccessMessages } from "../routes/messageRoutes.mjs";

export class ReservationService {
  reservationRepository: ReservationRepository;
  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async readEmails(): Promise<void> {
    try {
      const authenticated = await authorize();
      if (!authenticated) {
        console.log(
          `[${new Date()}] Not authenticated. Try to configure Gmail email`
        );
      }
    } catch (err) {
      console.error(`[${new Date()}] Error authorizing gmail apps ${err}`);
    }

    console.log(`[${new Date()}] Reading emails...`);
    const operations = await proccessMessages();

    if (operations.length === 0) {
      console.log(`[${new Date()}] No new emails found`);
      return;
    }

    for (const operation of operations) {
      if (operation.type === ReservationType.CANCEL) {
        const found = await this.reservationRepository.findReservation({
          date: operation.startDate,
          name: operation.name,
          venue: operation.venue,
        });

        if (!found || found.state === ReservationState.CANCELLED) {
          continue;
        }
        this.reservationRepository.cancel(found.id);
        console.log(
          `[${new Date()}] Reservation cancelled: ${found.id} - Date: ${
            found.reservation.startDate
          } - Venue: ${found.reservation.venue} - Name: ${
            found.reservation.name
          } - Venue: ${found.reservation.venue}`
        );
        continue;
      }

      const reservation = await this.reservationRepository.create(operation);
      console.log(
        `[${new Date()}] Reservation created: ${reservation.id} - ${
          operation.startDate
        } - ${operation.name} - ${operation.venue}`
      );

      // Generate token to reservation
      const keyCode = generateSevenDigitString();

      const password_id = await createDynamicKeyPassword(
        `${operation.venue} - ${operation.name}`,
        keyCode,
        operation.startDate.getTime(),
        operation.startDate.getTime() + 2 * 60 * 60 * 1000 // 2 hours
      );

      if ("error" in password_id) {
        console.error(
          `[${new Date()}] Error creating password: ${
            password_id.error.message
          }`
        );
        continue;
      }
      const reservationWithToken = await this.reservationRepository.asignToken(
        reservation,
        keyCode,
        password_id.password_id
      );

      console.log(
        `[${new Date()}] Reservation token assigned: ${
          reservationWithToken.id
        } - ${operation.startDate} - ${operation.name} - ${operation.venue}`
      );
    }
  }
}
