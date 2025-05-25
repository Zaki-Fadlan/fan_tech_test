import { parse, isValid } from "date-fns";
export const parsedDate = (dateStr: string) => {
  const parsedWaktu = parse(dateStr, "yyyy-MM-dd HH:mm:ss", new Date());
  if (!isValid(parsedWaktu)) {
    return false;
  }
  return parsedWaktu;
};
