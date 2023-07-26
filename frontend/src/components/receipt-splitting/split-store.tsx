import { Item } from "@/lib/schema";
import React from "react";
import { create, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

enableMapSet();

export interface SplitItem extends Item {
  buyers: Set<string>;
}

interface SplitProps {
  receipt: {
    title: string;
    creationDate: Date;
    total: number;
    items: Item[];
  };
  group: Set<string>;
}

interface SplitState {
  title: string;
  creationDate: Date;
  total: number;
  items: SplitItem[];
  group: Set<string>;
  actions: {
    toggleBuyer: (itemIndex: number, buyer: string) => void;
    toggleAllBuyers: (itemIndex: number) => void;
  };
}

type SplitStore = ReturnType<typeof createSplitStore>;

const createSplitStore = ({ receipt, group }: SplitProps) => {
  return create(
    immer<SplitState>((set) => ({
      title: receipt.title,
      creationDate: receipt.creationDate,
      total: receipt.total,
      items: receipt.items.map((item) => ({
        ...item,
        buyers: new Set(),
      })),
      group,
      actions: {
        toggleBuyer: (itemIndex, buyer) => {
          set((state) => {
            const item = state.items[itemIndex];

            if (item.buyers.has(buyer)) {
              item.buyers.delete(buyer);
            } else {
              item.buyers.add(buyer);
            }
          });
        },
        toggleAllBuyers: (itemIndex) => {
          set((state) => {
            const item = state.items[itemIndex];

            if (item.buyers.size === state.group.size) {
              item.buyers.clear();
            } else {
              item.buyers = new Set(state.group);
            }
          });
        },
      },
    }))
  );
};

type SplitProviderProps = React.PropsWithChildren<SplitProps>;

const SplitContext = React.createContext<SplitStore | null>(null);

export function SplitProvider({ children, ...props }: SplitProviderProps) {
  const storeRef = React.useRef<SplitStore>();

  if (!storeRef.current) {
    storeRef.current = createSplitStore(props);
  }

  return (
    <SplitContext.Provider value={storeRef.current}>
      {children}
    </SplitContext.Provider>
  );
}

function useSplitContext<T>(
  selector: (state: SplitState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = React.useContext(SplitContext);

  if (!store) {
    throw new Error("Missing SplitContext.Provider in the tree");
  }

  return useStore(store, selector, equalityFn);
}

export const useSplitReceiptInfo = () => {
  const title = useSplitContext((s) => s.title);
  const creationDate = useSplitContext((s) => s.creationDate);
  const total = useSplitContext((s) => s.total);

  return { title, creationDate, total };
};

export const useSplitItem = (index: number) =>
  useSplitContext((s) => s.items[index]);
export const useSplitItems = () => useSplitContext((s) => s.items);
export const useSplitGroup = () => useSplitContext((s) => s.group);

export const useSplitActions = () => useSplitContext((s) => s.actions);

export const useSplitTotal = () => {
  const items = useSplitItems();
  const group = useSplitGroup();

  const buyerTotals = Array.from(group).reduce((acc, buyer) => {
    acc[buyer] = 0;
    return acc;
  }, {} as Record<string, number>);

  items.forEach((item) => {
    const price = (item.price + item.discount) / item.buyers.size;

    item.buyers.forEach((buyer) => {
      buyerTotals[buyer] += price;
    });
  });

  const currentTotal = Object.values(buyerTotals).reduce(
    (acc, total) => acc + total,
    0
  );

  return { buyerTotals, currentTotal };
};
