export class ReceiptParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptParsingError";
  }
}
