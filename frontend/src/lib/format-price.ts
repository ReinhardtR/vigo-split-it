const numberFormat = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
});

export function formatPrice(price: number) {
  return numberFormat.format(price);
}
