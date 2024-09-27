import { load, CheerioAPI } from "cheerio";
import { parsingDate } from "./parseDateTime.mjs";

interface BaseReservation {
  name: string;
  venue: string;
  startDate: Date;
}

export enum ReservationType {
  NEW = "NEW",
  CANCEL = "CANCEL",
}

export interface EmailNewReservation extends BaseReservation {
  type: ReservationType.NEW;
  phone: string;
  endDate: Date;
}

export interface CancelReservation extends BaseReservation {
  type: ReservationType.CANCEL;
}

export type EmailOperation = EmailNewReservation | CancelReservation;

export function emailParsing(
  html: string,
  referenceDate: Date = new Date()
): EmailNewReservation | CancelReservation {
  // Parse the email
  const cheerioAPI: CheerioAPI = load(html);

  // Extract the information
  const venue = cheerioAPI('td:contains("Cancha")').next().text().trim();

  const isNewReservation =
    cheerioAPI('h1:contains("¡Nueva reserva online!")').length > 0;

  if (isNewReservation) {
    return parseNewReservation(cheerioAPI, venue, referenceDate);
  }

  const isCancelReservation = cheerioAPI("body")
    .text()
    .includes("Reserva online cancelada");

  if (!isCancelReservation) {
    throw new Error("Invalid email");
  }

  const name = cheerioAPI('td:contains("Jugador")')
    .next() // Selecciona el siguiente 'td' que contiene el nombre
    .text() // Obtiene el texto del elemento
    .trim(); // Elimina espacios en blanco al principio y al final

  const startDateStr = cheerioAPI('td:contains("Dia y hora")')
    .next()
    .text()
    .trim();

  let startDate: Date | null = null;
  try {
    startDate = parsingDate(startDateStr, referenceDate);
  } catch (err) {
    console.log("Error while parsing date");
  }

  return {
    type: ReservationType.CANCEL,
    name,
    venue,
    startDate: startDate || new Date(),
  };
}

function parseNewReservation(
  $: CheerioAPI,
  venue: string,
  referenceDate: Date
): EmailNewReservation {
  const name = $('td:contains("Nombre")').next().text().trim();
  const phone = $('td:contains("Teléfono")').next().text().trim();
  const startDateStr = $('td:contains("Dia y hora")').next().text().trim();

  // Convertir la fecha a un objeto Date
  let startDate: Date | null = null;
  try {
    startDate = parsingDate(startDateStr, referenceDate);
  } catch (err) {
    console.log("Error while parsing date");
  }

  return {
    type: ReservationType.NEW,
    name,
    venue,
    startDate: startDate || new Date(),
    endDate: new Date(),
    phone,
  };
}
