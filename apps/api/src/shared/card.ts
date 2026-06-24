import { z } from "zod";

export function isLuhnValid(value: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isCardExpired(month: string, year: string, now = new Date()) {
  const numericYear = Number(year.length === 2 ? `20${year}` : year);
  const numericMonth = Number(month);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return numericYear < currentYear || (numericYear === currentYear && numericMonth < currentMonth);
}

export const paymentCardSchema = z
  .object({
    number: z
      .string()
      .transform((value) => value.replace(/[\s-]/g, ""))
      .refine((value) => /^\d{12,19}$/.test(value), "Введите от 12 до 19 цифр")
      .refine(isLuhnValid, "Проверьте номер карты"),
    holder: z.string().trim().min(3, "Укажите имя владельца карты").max(120),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Введите месяц от 01 до 12"),
    expYear: z.string().regex(/^\d{2}(\d{2})?$/, "Введите год в формате ГГ или ГГГГ"),
    cvc: z.string().regex(/^\d{3,4}$/, "Введите 3 или 4 цифры CVC")
  })
  .superRefine((card, context) => {
    if (isCardExpired(card.expMonth, card.expYear)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expYear"],
        message: "Срок действия карты истёк"
      });
    }
  });
