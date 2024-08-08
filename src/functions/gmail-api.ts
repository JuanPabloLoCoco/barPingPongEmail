import { google } from "googleapis";
import { ParsedMail, simpleParser } from "mailparser";

const gmail = google.gmail("v1");
/**
 * Get messages from gmail api
 * @return {array} the array of messages
 */
export const getMessages = async () => {
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX", "UNREAD"],
  });

  if (response.data.resultSizeEstimate === 0) {
    return [];
  }

  const messages = response.data.messages;

  if (!messages) {
    return [];
  }

  const processedMessages = await Promise.all(
    messages.map(async (message) => {
      if (!message.id) {
        return null;
      }
      const messageResponse = await getMessage(message.id);
      return messageResponse;
    })
  );

  const processedMails: ParsedMail[] = [];
  for (const mail of processedMessages) {
    if (mail) {
      processedMails.push(mail);
    }
  }

  return processedMails;
};

export const getMessage = async (id: string): Promise<ParsedMail> => {
  const response = await gmail.users.messages.get({
    id,
    userId: "me",
    format: "raw",
  });
  const rawMessage = response.data.raw;
  const bufferedRawMessage = Buffer.from(rawMessage || "", "base64").toString(
    "utf-8"
  );
  return await simpleParser(bufferedRawMessage);
};
