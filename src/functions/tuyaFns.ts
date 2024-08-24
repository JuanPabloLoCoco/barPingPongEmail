// @ts-expect-error
import { ModeOfOperation, utils, padding } from "aes-js";

// toBytes -> new TextEncoder().encode()
// fromBytes -> new TextDecoder().decode()
export function decriptAES128ECB(cypher: string, key: string) {
  const _key = new TextEncoder().encode(key);
  const iv = new TextEncoder().encode("0000000000000000");
  const cypherBytes = Buffer.from(cypher, "hex"); // utils.hex.toBytes(cypher);

  const aesECB = new ModeOfOperation.ecb(_key, iv);
  const decryptedBytes = aesECB.decrypt(cypherBytes);

  const newArr = padding.pkcs7.strip(decryptedBytes);

  return new TextDecoder().decode(newArr);
}

export function encryptAES128ECB(plaintext: string, key: string) {
  const _key = new TextEncoder().encode(key);
  const iv = new TextEncoder().encode("0000000000000000");

  const aesECB = new ModeOfOperation.ecb(_key, iv);
  const textBytes = padding.pkcs7.pad(new TextEncoder().encode(plaintext));

  const encryptedBytes = aesECB.encrypt(textBytes);

  return utils.hex.fromBytes(encryptedBytes);
}

export function getSignedPassword(
  lock_password: string,
  ticketKey: string,
  clientSecret: string
) {
  const received = decriptAES128ECB(ticketKey, clientSecret);
  return encryptAES128ECB(lock_password, received);
}
