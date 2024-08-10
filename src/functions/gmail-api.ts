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

export const markAsRead = async (id: string) => {
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });
};

export const modifyMessageLabels = async (
  id: string,
  labelsToAdd: string[],
  labelsToRemove: string[]
) => {
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: {
      addLabelIds: labelsToAdd,
      removeLabelIds: labelsToRemove,
    },
  });
};

/**
 * Given the attachment id, get specific attachment data
 * @param  {string} attachmentId The attachment id to retrieve for
 * @param  {string} messageId The message id where the attachment is
 * @return {object} the object attachment data
 */
// export const getAttachment = async ({attachmentId, messageId}) => {
//   const response = await gmail.users.messages.attachments.get({
//       id: attachmentId, messageId, userId: 'me'
//   })
//   const attachment = response.data
//   return attachment
// }

/**
 * Get all messages thread for a given message id
 * @param  {string} messageId The message id to retrieve its thread
 * @return {array} the array of messages
 */
// export const getThread = async ({messageId}) => {
//   const response = await gmail.users.threads.get({id: messageId, userId: 'me'})
//   const messages = await Promise.all(response.data.messages.map(async (message: any) => {
//       const messageResponse = await gmail.users.messages.get({id: message.id, userId: 'me'})
//       return parseMessage(messageResponse.data)
//   }))
//   return messages
// }

/**
 * Send a mail message with given arguments
 * @param  {string} to The receiver email
 * @param  {string} subject The subject of the mail
 * @param  {string} text The text content of the message
 * @param  {Array}  attachments An array of attachments
 */
// export const sendMessage = async ({to, subject = '', text = '', attachments = []}: {to: string, subject?: string, text?: string, attachments?: any[]}) => {

//   // build and encode the mail
//   const buildMessage = () => new Promise<string>((resolve, reject) => {
//       const message  = new MailComposer({
//           to,
//           subject,
//           text,
//           attachments,
//           textEncoding: 'base64'
//       })

//       message.compile().build((err, msg) => {
//           if (err){
//               reject(err)
//           }

//           const encodedMessage = Buffer.from(msg)
//               .toString('base64')
//               .replace(/\+/g, '-')
//               .replace(/\//g, '_')
//               .replace(/=+$/, '')

//           resolve(encodedMessage)
//       })
//   })

//   const encodedMessage = await buildMessage()

//   await gmail.users.messages.send({
//       userId: 'me',
//       requestBody: {
//           raw: encodedMessage
//       }
//   })
// }
