import {
  useSplitActions,
  useSplitGroup,
  useSplitItem,
  useSplitItems,
  useSplitReceiptInfo,
  useSplitTotal,
} from "@/components/receipt-splitting/split-store";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format-price";

export function ReceiptSplitting() {
  const items = useSplitItems();
  const info = useSplitReceiptInfo();
  const summary = useSplitTotal();

  return (
    <div className="flex flex-col space-y-4">
      {items.map((item, i) => (
        <ReceiptItemCard key={item.name + i} index={i} />
      ))}
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <p>Total</p>
          <p className="font-medium">{formatPrice(info.total)}</p>
        </div>

        <div className="flex justify-between items-center">
          <p>Current Total</p>
          <p className="font-medium">{formatPrice(summary.currentTotal)}</p>
        </div>

        {Object.entries(summary.buyerTotals).map(([buyer, total]) => (
          <div
            key={buyer}
            className="flex justify-between items-center text-sm"
          >
            <p>{buyer}</p>
            <p className="font-medium">{formatPrice(total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReceiptItemCardProps = {
  index: number;
};

function ReceiptItemCard({ index }: ReceiptItemCardProps) {
  const item = useSplitItem(index);
  const group = useSplitGroup();
  const { toggleBuyer, toggleAllBuyers } = useSplitActions();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-[380px]">
      <div className="flex justify-between items-center space-y-1.5 p-6">
        <p className="font-medium">{item.name}</p>
        <p>{formatPrice(item.price + item.discount)}</p>
      </div>
      <div className="flex flex-wrap space-y-1 items-center p-6 pt-0">
        <Badge
          className="hover:cursor-pointer mr-2"
          variant="outline"
          onClick={() => toggleAllBuyers(index)}
        >
          Alle
        </Badge>
        {Array.from(group).map((person) => (
          <Badge
            key={person}
            className="hover:cursor-pointer mr-2"
            variant={item.buyers.has(person) ? "default" : "secondary"}
            onClick={() => toggleBuyer(index, person)}
          >
            {person}
          </Badge>
        ))}
      </div>
    </div>
  );
}
