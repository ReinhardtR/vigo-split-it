import { ReceiptContent } from "@/lib/schema";

const API_URL = "https://vigo-split-it-backend.onrender.com/";

type getReceiptContentParams = {
  shopReceipt: File;
};

export async function getReceiptContent(params: getReceiptContentParams) {
  const formData = new FormData();
  formData.append("shopReceipt", params.shopReceipt);

  const response = await fetch(
    import.meta.env.PROD ? API_URL : "http://localhost:8080",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message);
  }

  const responseData = await response.json();

  try {
    const receiptContent = ReceiptContent.parse(responseData);

    return receiptContent;
  } catch (e) {
    throw new Error(`Recieved unexpected data from server: ${e}`);
  }
}
