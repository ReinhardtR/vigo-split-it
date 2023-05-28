import PDFParser, { Output } from "pdf2json";

export function parsePdf(pdf: Buffer) {
  return new Promise<Output>((resolve, reject) => {
    const parser = new PDFParser();
    parser.loadPDF("./receipt.pdf");

    parser.on("pdfParser_dataError", (errData) => {
      reject(errData);
    });

    parser.on("pdfParser_dataReady", (pdfData) => {
      resolve(pdfData);
    });
  });
}
