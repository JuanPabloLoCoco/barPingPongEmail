import aesjs from "aes-js";

// toBytes -> new TextEncoder().encode()
// fromBytes -> new TextDecoder().decode()
export function decriptAES128ECB(cypher: string, key: string) {
  const _key = new TextEncoder().encode(key);
  const iv = new TextEncoder().encode("0000000000000000");
  const cypherBytes = Buffer.from(cypher, "hex"); // utils.hex.toBytes(cypher);

  // @ts-expect-error
  const aesECB = new aesjs.ModeOfOperation.ecb(_key, iv);
  const decryptedBytes = aesECB.decrypt(cypherBytes);

  const newArr = aesjs.padding.pkcs7.strip(decryptedBytes);

  return new TextDecoder().decode(newArr);
}

export function encryptAES128ECB(plaintext: string, key: string) {
  const _key = new TextEncoder().encode(key);
  const iv = new TextEncoder().encode("0000000000000000");

  // @ts-expect-error
  const aesECB = new aesjs.ModeOfOperation.ecb(_key, iv);
  const textBytes = aesjs.padding.pkcs7.pad(
    new TextEncoder().encode(plaintext)
  );

  const encryptedBytes = aesECB.encrypt(textBytes);

  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

export function getSignedPassword(
  lock_password: string,
  ticketKey: string,
  clientSecret: string
) {
  const received = decriptAES128ECB(ticketKey, clientSecret);
  return encryptAES128ECB(lock_password, received);
}
