import { z } from "zod";

export const Item = z.object({
  name: z.string(),
  price: z.number(),
  discount: z.number(),
});
export type Item = z.infer<typeof Item>;

export const ReceiptContent = z.object({
  receipt: z.object({
    title: z.string(),
    creationDate: z.coerce.date(),
    total: z.number(),
    items: z.array(Item),
  }),
});
export type ReceiptContent = z.infer<typeof ReceiptContent>;
