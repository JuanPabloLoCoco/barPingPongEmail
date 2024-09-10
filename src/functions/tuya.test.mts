import { describe, test, expect } from "@jest/globals";
import {
  decriptAES128ECB,
  encryptAES128ECB,
  getSignedPassword,
} from "./tuyaFns.mjs";

describe("Test tuya workflows", () => {
  test("Encript ticket & decrypt ticket", async () => {
    const ticket_key =
      "582CF03E83F679C0BB3D8446227F84DDE7062ECDFAE6BECC87092B8BDB42B064";

    const clientSecret = "fedce13116c949e59400d4c3927f81df";

    const expected = "4IpL8aSrPwqi1Ik4";

    const received = decriptAES128ECB(ticket_key, clientSecret);
    expect(received).toBe(expected);

    // 4 -Encrypt Pin Code:
    const generatedPin = "1234567";

    const expectedPassword = "16c223772bba092e2e38641070d24dbb";
    expect(encryptAES128ECB(generatedPin, received)).toBe(expectedPassword);
  });

  test("Test entire workflow", async () => {
    expect(
      getSignedPassword(
        "1234567",
        "582CF03E83F679C0BB3D8446227F84DDE7062ECDFAE6BECC87092B8BDB42B064",
        "fedce13116c949e59400d4c3927f81df"
      )
    ).toBe("16c223772bba092e2e38641070d24dbb");
  });
});

// 1 - Obtain Access Token:
// Endpoint: /v1.0/token?grant_type=1 (GET method)
// Description: Acquire an access token from Tuya's API, essential for authentication and authorization to make further requests.
//
// 2 - Request Access Key:
// Endpoint: /v1.0/devices/[device_id]/door-lock/password-ticket (POST method)
// Description: Use the acquired access token to request an access key (or password ticket) from
// Tuya's API, necessary for generating a new door lock password.

// 3 - Decrypt Access Key:
// Description: Decrypt the obtained ticket key using https://www.lddgo.net/en/encrypt/aes. Use
// the following settings: Mode=ECB, Padding=pkcs7padding, Input Format=Hex, Output Format=String,
// Password=Your Tuya project client secret (details at https://support.tuya.com/en/help/_detail/Kasgyvlkrcufp),
// Charset=UTF-8.

// 4 -Encrypt Pin Code:
// Description: Encrypt the chosen 7-digit pin code using the same online tool as above. Modify the password to the decrypted value from the previous step, Input Format=String, Output Format=Hex.

// 5 - Create a Password:
// Endpoint: /v1.0/devices/[device_id]/door-lock/temp-password (POST method)
// Description: Submit the encrypted pin code with additional required details (effective and expiration time of the password) to Tuya's API. This is for creating a temporary password for the door lock. In the request body, include the encrypted pin code as "password", the ticket_id from step 2, and timestamps for the effective and invalid times, as shown in this example.
// { "password": "9c63efba8fb57e89319dff9117d3765a", "password_type": "ticket", "ticket_id": "cNOYOdpM", "effective_time": 1701187200000, "invalid_time": 1701360000000, "name": "test666", "time_zone": "" }

// Note: For Postman users, it's recommended to use the Postman collection from https://developer.tuya.com/en/docs/iot/set-up-postman-environment?id=Ka7o385w1svns. This collection includes pre-written JavaScript code that calculates the sign value for each request.

// https://stackoverflow.com/questions/74994699/how-do-i-encrypt-a-password-for-tuya-smart-lock-open-api
