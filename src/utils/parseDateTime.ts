enum State {
  DIA_SEMANA = "DIA_SEMANA",
  DIA_NUMERO = "DIA_NUMERO",
  MES = "MES",
  HORA = "HORA",
  END = "END",
}

const daysOfTheWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export enum ErrorMessages {
  INVALID_DAY_OF_THE_WEEK = "Invalid date time, day of the week not found",
  INVALID_DAY_NUMBER = "Invalid date time, day number not found",
  INVALID_MONTH = "Invalid date time, month not found",
  INVALID_TIME = "Invalid date time, not a valid time",
  INVALID_DATE = "Invalid date time, not a valid date",
}

function strIsString(str: string): boolean {
  return Number.isInteger(parseInt(str));
}

interface SepararFechaHoraRet {
  diaSemana: string;
  dia: number;
  mes: number;
  hora: string;
}

export function separarFechaHora(cadena: string): SepararFechaHoraRet {
  let estado: State = State.DIA_SEMANA; // Estado inicial
  let diaSemana = "";
  let dia = 0;
  let mes = 0;
  let hora = "";
  let buffer = ""; // Para acumular caracteres temporales
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  let i = 0;

  while (i < cadena.length) {
    let char = cadena[i];
    switch (estado) {
      case State.DIA_SEMANA:
        if (char === " ") {
          diaSemana = buffer;
          const lowerCaseBuffer = diaSemana.toLowerCase();
          if (!daysOfTheWeek.includes(lowerCaseBuffer)) {
            throw new Error(ErrorMessages.INVALID_DAY_OF_THE_WEEK);
          }
          buffer = "";
          estado = State.DIA_NUMERO; // Cambiar al siguiente estado
        } else {
          buffer += char;
        }
        break;

      case State.DIA_NUMERO:
        if (char === " ") {
          const expectedStr = " de ";
          if (cadena.length - i < expectedStr.length) {
            throw new Error(ErrorMessages.INVALID_DAY_NUMBER);
          }
          let j = 0;
          for (; j < expectedStr.length; j++) {
            if (cadena[j + i] !== expectedStr[j]) {
              throw new Error(ErrorMessages.INVALID_DAY_NUMBER);
            }
          }
          i = j + i - 1;

          if (!strIsString(buffer)) {
            throw new Error(ErrorMessages.INVALID_DAY_NUMBER);
          }
          dia = parseInt(buffer);

          buffer = "";
          estado = State.MES;
          // }
        } else {
          if (!/[0-9]/.test(char)) {
            throw new Error(ErrorMessages.INVALID_DAY_NUMBER);
          }
          buffer += char;
        }
        break;

      case State.MES:
        if (char === " ") {
          const expectedStr = " a las ";
          if (cadena.length - i < expectedStr.length) {
            throw new Error(ErrorMessages.INVALID_MONTH);
          }
          let j = 0;
          for (; j < expectedStr.length; j++) {
            if (cadena[j + i] !== expectedStr[j]) {
              throw new Error(ErrorMessages.INVALID_MONTH);
            }
          }
          i = j + i - 1;
          const lowerCaseBuffer = buffer.toLowerCase();
          const monthIndex = months.findIndex(
            (month) => month === lowerCaseBuffer
          );
          if (monthIndex < 0) {
            throw new Error(ErrorMessages.INVALID_MONTH);
          }
          mes = monthIndex + 1;
          buffer = "";
          estado = State.HORA;
        } else {
          buffer += char;
        }
        break;

      case State.HORA:
        if (char === " ") {
          if (!timeRegex.test(buffer)) {
            throw new Error(ErrorMessages.INVALID_TIME);
          }
          return { diaSemana, dia, mes, hora };
        }
        buffer += char;
        break;
    }
    i++;
  }

  if (estado !== State.HORA) {
    throw new Error("Invalid date time, not a valid date");
  }
  if (hora === "") {
    if (!timeRegex.test(buffer)) {
      throw new Error("Invalid date time, not a valid time");
    }
    hora = buffer;
  }

  return { diaSemana, dia, mes, hora };
}

export function parsingDate(dateStr: string, today: Date): Date | null {
  try {
    const parsedDate = separarFechaHora(dateStr);

    // Día, mes y hora en UTC
    const dayUTC = parsedDate.dia; // Por ejemplo, el día 2
    const monthUTC = parsedDate.mes; // Por ejemplo, el mes de julio (0-indexado, enero es 0)
    const hourMinute = parsedDate.hora; // Hora en formato HH:mm

    // Descomponer la hora y minuto
    const [hours, minutes] = hourMinute.split(":").map(Number);

    const year = getDateYear(monthUTC, dayUTC, today);

    // Crear un objeto Date en UTC
    const dateUTC = new Date(
      Date.UTC(year, monthUTC - 1, dayUTC, hours + 3, minutes)
    );

    return dateUTC;
  } catch (error) {
    throw new Error("Invalid date time");
  }
}

function getDateYear(utcMonth: number, utcDay: number, today: Date): number {
  const currentMonth = today.getUTCMonth() + 1;
  const currentDay = today.getUTCDate();

  if (utcMonth < currentMonth) {
    return today.getUTCFullYear() + 1;
  }

  if (utcMonth > currentMonth) {
    return today.getUTCFullYear();
  }

  return utcDay >= currentDay
    ? today.getUTCFullYear()
    : today.getUTCFullYear() + 1;
}
