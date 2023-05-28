import { fastify } from "fastify";
import { parseReceiptContent } from "./lib/parse-receipt-texts";
import { parsePdf } from "./lib/parse-pdf";
import { ReceiptParsingError } from "./lib/receipt-parsing-error";
import FastifyMultipart from "@fastify/multipart";
import FastifyCors from "@fastify/cors";

const server = fastify({ logger: true });
server.register(FastifyCors, {
  origin: "*",
  methods: ["POST"],
});
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

server.listen({ port: Number(process.env.PORT) || 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
