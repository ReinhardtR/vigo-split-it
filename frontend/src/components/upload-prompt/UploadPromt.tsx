import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getReceiptContent } from "@/lib/get-receipt-content";
import React from "react";
import { Icons } from "@/components/ui/icons";
import { ReceiptContent } from "@/lib/schema";

const formSchema = z.object({
  shopReceipt: z.instanceof(File),
  deliveryReceipt: z.instanceof(File),
});

type UploadPromptProps = {
  onSucess: (receiptContent: ReceiptContent) => void;
};

export function UploadPrompt(props: UploadPromptProps) {
  const [submitError, setSubmitError] = React.useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit({ shopReceipt }: z.infer<typeof formSchema>) {
    try {
      const receiptContent = await getReceiptContent({ shopReceipt });
      props.onSucess(receiptContent);
    } catch (e) {
      setSubmitError((e as Error).message ?? "An unexpected error occured");
    }
  }

  return (
    <>
      <h1 className="text-4xl font- text-center mb-20">
        Split It - REMA 1000 Vigo
      </h1>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-8">
          <span className="block sm:inline">{submitError}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="shopReceipt"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Butikskvittering</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => onChange(event.target.files?.[0])}
                    {...fieldProps}
                  />
                </FormControl>
                <FormDescription>
                  Kvittering af de købte varer i REMA 1000.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryReceipt"
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Leveringskvittering</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => onChange(event.target.files?.[0])}
                    {...fieldProps}
                  />
                </FormControl>
                <FormDescription>
                  Kvittering af Vigo's leveringsgebyr.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
