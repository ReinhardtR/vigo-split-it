// e.g.: dateString = "D:20230527122930+00'00'"
export function dateFromDFormat(dateString: string) {
  // Extract the relevant parts of the date string
  const year = Number(dateString.substring(2, 6));
  const month = Number(dateString.substring(6, 8));
  const day = Number(dateString.substring(8, 10));
  const hour = Number(dateString.substring(10, 12));
  const minute = Number(dateString.substring(12, 14));
  const second = Number(dateString.substring(14, 16));

  // Create the Date object using the extracted parts
  return new Date(year, month - 1, day, hour, minute, second);
}
