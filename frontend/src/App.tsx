import React from "react";
import { UploadPrompt } from "@/components/upload-prompt/UploadPromt";
import { ReceiptSplitting } from "@/components/receipt-splitting/ReceiptSplitting";
import { ReceiptContent } from "@/lib/schema";
import { SplitProvider } from "@/components/receipt-splitting/split-store";

export function App() {
  const [receiptContent, setReceiptContent] = React.useState<ReceiptContent>();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {receiptContent ? (
        <SplitProvider
          receipt={receiptContent.receipt}
          group={new Set(["Reinhardt", "Frederik"])}
        >
          <ReceiptSplitting />
        </SplitProvider>
      ) : (
        <UploadPrompt onSucess={setReceiptContent} />
      )}
    </main>
  );
}
