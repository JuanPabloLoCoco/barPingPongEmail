import { Router, Request, Response } from "express";
import { EmailAddress } from "mailparser";
import { getMessages, markAsRead } from "../gmail/api";
import { emailParsing, EventType } from "../parseEmail/emailParsing";

const router = Router();

router.get("/getMessages", async (req: Request, res: Response) => {
  try {
    const listOfOrders = await proccessMessages();

    return res.send({ events: listOfOrders });
  } catch (e) {
    console.error(e);
    return res.send({ error: e });
  }
});

export interface EmailData {
  html: string;
  from: EmailAddress[];
  date: Date;
  messageId: string;
}

export async function proccessMessages(): Promise<EmailData[]> {
  const messages = await getMessages();

  const listOfOrders: EmailData[] = [];
  for (const message of messages) {
    const html = message.html;
    if (!html) {
      continue;
    }
    try {
      const fromAddress = message.from?.value || [];
      const validAddress = [
        "palitolococo@gmail.com",
        "noreply@alquilatucancha.com",
      ];
      const hasValidAddress = fromAddress.some(
        (x: EmailAddress) =>
          x.address === validAddress[0] || x.address === validAddress[1]
      );
      if (!hasValidAddress) {
        continue;
      }

      // const evt = emailParsing(html, new Date());
      console.log(message.date);
      listOfOrders.push({
        html,
        from: fromAddress,
        date: message.date || new Date(),
        messageId: message.messageId!,
      });

      await markAsRead(message.messageId!);
    } catch (err) {
      continue;
    }
  }

  return listOfOrders;
}

export { router };
