import { Output } from "pdf2json";
import { ReceiptParsingError } from "./receipt-parsing-error";
import { dateFromDFormat } from "../utils/date-from-d-format";
import Decimal from "decimal.js";

type Item = {
  name: string;
  price: Decimal;
  discount: Decimal;
};

export function parseReceiptContent(content: Output) {
  const page = content.Pages[0];

  if (!page) {
    throw new ReceiptParsingError("Could not find page in receipt");
  }

  const creationDateString = content.Meta["CreationDate"] as string | undefined;
  const title = content.Meta["Title"] as string | undefined;

  if (!creationDateString || !title) {
    throw new ReceiptParsingError(
      "Could not find date or title in receipt metadata"
    );
  }

  const creationDate = dateFromDFormat(creationDateString);

  const itemsStartLine = page.HLines[1];
  const itemsEndLine = page.HLines[2];
  const summaryStartLine = page.HLines[2];
  const summaryEndLine = page.HLines[3];

  if (
    !itemsStartLine ||
    !itemsEndLine ||
    !summaryStartLine ||
    !summaryEndLine
  ) {
    throw new ReceiptParsingError("Could not find horizontal lines in receipt");
  }

  const itemSectionTexts = page.Texts.filter(
    (text) => text.y >= itemsStartLine.y && text.y <= itemsEndLine.y
  );
  const itemLines: { name: string; price: Decimal; quantity: number }[] = [];
  for (let i = 0; i < itemSectionTexts.length; i++) {
    const text = itemSectionTexts[i];

    if (!text || !text.R[0]?.T) {
      throw new ReceiptParsingError("Could not find text in receipt.");
    }

    const textContent = text.R[0].T;

    const createNewItemLine = () => {
      itemLines.push({
        name: decodeURIComponent(textContent),
        price: new Decimal(0),
        quantity: 1,
      });
    };

    const latestItemLine = itemLines[itemLines.length - 1];

    if (!latestItemLine) {
      createNewItemLine();
      continue;
    }

    // e.g.: "8 á 2,50", the "á" character would be encoded as "%C3%A1"
    const isQuantityLabel = textContent.includes("%C3%A1");
    if (isQuantityLabel) {
      latestItemLine.quantity = Number(
        decodeURIComponent(textContent).split(" ")[0]
      );
      continue;
    }

    const price = Number(decodeURIComponent(textContent).replace(",", "."));
    if (!Number.isNaN(price)) {
      latestItemLine.price = new Decimal(price);
      continue;
    }

    createNewItemLine();
  }

  console.log(itemLines);

  const items: Item[] = [];
  itemLines.forEach((itemLine) => {
    const isDiscountItem = itemLine.name.includes("Rabat");
    if (isDiscountItem) {
      const prevItem = items[items.length - 1];

      if (!prevItem) {
        throw new ReceiptParsingError(
          "Found discount item, but no previous item to apply discount to."
        );
      }

      const prevItemsWithSameName: Item[] = [];
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        if (item && item.name === prevItem.name && item.discount.eq(0)) {
          prevItemsWithSameName.push(item);
        } else {
          break;
        }
      }

      prevItemsWithSameName.forEach((item) => {
        item.discount = itemLine.price.div(prevItemsWithSameName.length);
      });

      return;
    }

    for (let i = 0; i < itemLine.quantity; i++) {
      items.push({
        name: itemLine.name,
        price: itemLine.price.div(itemLine.quantity),
        discount: new Decimal(0),
      });
    }
  });

  console.log(items);

  const totalFromItems = items.reduce(
    (sum, item) => sum.add(item.price.add(item.discount)),
    new Decimal(0)
  );

  const summaryTexts = page.Texts.filter(
    (text) => text.y >= summaryStartLine.y && text.y <= summaryEndLine.y
  );

  const totalText = summaryTexts[1];

  if (!totalText || !totalText.R[0]?.T) {
    throw new ReceiptParsingError("Could not find total in receipt.");
  }

  const total = new Decimal(
    decodeURIComponent(totalText.R[0].T).replace(",", ".")
  );

  if (total.isNaN()) {
    throw new ReceiptParsingError(
      `Could not parse total from receipt. (${totalText.R[0].T})`
    );
  }

  if (!total.eq(totalFromItems)) {
    throw new ReceiptParsingError(
      `Total from items (${totalFromItems}) does not match total from receipt (${total}).`
    );
  }

  return {
    title,
    creationDate,
    total: total.toNumber(),
    items: items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      discount: item.discount.toNumber(),
    })),
  };
}
