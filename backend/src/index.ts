import { fastify } from "fastify";
import { parseReceiptContent } from "./lib/parse-receipt-texts";
import { parsePdf } from "./lib/parse-pdf";
import { ReceiptParsingError } from "./lib/receipt-parsing-error";
import FastifyMultipart from "@fastify/multipart";
import FastifyCors from "@fastify/cors";

const server = fastify({ logger: true });

server.register(FastifyCors);
server.register(FastifyMultipart);

server.post("/", async (req, res) => {
  const file = await req.file();

  if (!file) {
    res.status(400).send({ message: "No file provided" });
    return;
  }

  if (file.mimetype !== "application/pdf") {
    res.status(400).send({ message: "File is not a PDF" });
    return;
  }

  const buffer = await file.toBuffer();
  const pdf = await parsePdf(buffer);

  try {
    const receipt = parseReceiptContent(pdf);

    res.send({ receipt });
    return;
  } catch (e) {
    if (e instanceof ReceiptParsingError) {
      res.status(400).send({ message: e.message });
      return;
    }
  }

  res.status(500).send({ message: "Internal server error" });
});

async function start() {
  try {
    const host =
      process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

    await server.listen({ host, port });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
