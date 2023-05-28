import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { parseReceiptContent } from "./lib/parse-receipt-texts";
import { parsePdf } from "./lib/parse-pdf";
import { ReceiptParsingError } from "./lib/receipt-parsing-error";

const server = fastify({ logger: true });
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/parse-receipt",
  schema: {
    body: z.object({
      pdf: z.instanceof(Blob),
    }),
  },
  handler: async (req, res) => {
    const pdf = await req.body.pdf
      .arrayBuffer()
      .then(Buffer.from)
      .then(parsePdf);

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
  },
});

server.listen({ port: Number(process.env.PORT) || 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
