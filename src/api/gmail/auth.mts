import { google } from "googleapis";
import { Credentials } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
];

let token_loaded = "";

export const authorize = async () => {
  if (token_loaded) {
    authenticate(JSON.parse(token_loaded));
    return true;
  }

  return false;
};

export const getNewToken = async () => {
  const oAuth2Client = getOAuth2Client();

  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
};

export const saveToken = async (token: Credentials) => {
  token_loaded = token;
};

export const getOAuth2Client = () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  return oAuth2Client;
};

const authenticate = (token: Credentials) => {
  const oAuth2Client = getOAuth2Client();

  oAuth2Client.setCredentials(token);
  google.options({
    auth: oAuth2Client,
  });
};
