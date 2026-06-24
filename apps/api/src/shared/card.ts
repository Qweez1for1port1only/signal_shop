import { z } from "zod";

export const paymentCardSchema = z
  .object({
    number: z
      .string()
      .transform((value) => value.replace(/[\s-]/g, ""))
      .refine((value) => /^\d{12,19}$/.test(value), "Введите от 12 до 19 цифр"),
    holder: z.string().trim().min(3, "Укажите имя владельца карты").max(120),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Введите месяц от 01 до 12"),
    expYear: z.string().regex(/^\d{2}(\d{2})?$/, "Введите год в формате ГГ или ГГГГ"),
    cvc: z.string().regex(/^\d{3,4}$/, "Введите 3 или 4 цифры CVC")
  });
