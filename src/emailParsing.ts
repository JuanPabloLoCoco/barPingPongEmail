import { load } from "cheerio";

interface BaseReservation {
  name: string;
  venue: string;
  startDate: Date;
}

export enum ReservationType {
  NEW = "NEW",
  CANCEL = "CANCEL",
}

export interface NewReservation extends BaseReservation {
  type: ReservationType.NEW;
  phone: string;
  endDate: Date;
}

export interface CancelReservation extends BaseReservation {
  type: ReservationType.CANCEL;
}

export function emailParsing(html: string): NewReservation | CancelReservation {
  // Parse the email
  const $ = load(html);

  // Extract the information
  const venue = $('td:contains("Cancha")').next().text().trim();

  const isNewReservation =
    $('h1:contains("¡Nueva reserva online!")').length > 0;

  if (isNewReservation) {
    return parseNewReservation($, venue);
  }

  const isCancelReservation = $("body")
    .text()
    .includes("Reserva online cancelada");

  if (!isCancelReservation) {
    throw new Error("Invalid email");
  }

  const name = $('td:contains("Jugador")')
    .next() // Selecciona el siguiente 'td' que contiene el nombre
    .text() // Obtiene el texto del elemento
    .trim(); // Elimina espacios en blanco al principio y al final

  return {
    type: ReservationType.CANCEL,
    name,
    venue,
    startDate: new Date(),
  };
}

function parseNewReservation($: cheerio.Root, venue: string): NewReservation {
  const name = $('td:contains("Nombre")').next().text().trim();
  const phone = $('td:contains("Teléfono")').next().text().trim();
  const startDateStr = $('td:contains("Dia y hora")').next().text().trim();

  // Convertir la fecha a un objeto Date
  const parsedDate = startDateStr.match(/(\w+ \d+ de \w+ a las \d{2}:\d{2})/);
  let startDate = null;

  if (parsedDate) {
    const [day, , month, , time] = parsedDate[0].split(/\sde\s| a las /);
    const dateStr = `${day} ${month} ${new Date().getFullYear()} ${time}`;
    startDate = new Date(dateStr);
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
