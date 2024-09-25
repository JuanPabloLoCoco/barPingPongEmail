export function generateSevenDigitString(): string {
  const max = 9999999;
  const randNum = Math.floor(Math.random() * (max + 1));

  return randNum.toString().padStart(7, "0");
}
