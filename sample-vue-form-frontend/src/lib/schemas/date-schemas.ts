import { z } from "zod";

export const DATE_CONFIG = {
  year: { min: 1900, max: 2100 },
  month: { min: 1, max: 12 },
  day: { min: 1, max: 31 },
} as const;

export const zodYear = z
  .string()
  .refine((val) => val === "" || !isNaN(Number(val)), { message: "年は数値で入力してください" })
  .refine((val) => val === "" || Number(val) >= DATE_CONFIG.year.min, {
    message: `年は${DATE_CONFIG.year.min}以上で入力してください`,
  })
  .refine((val) => val === "" || Number(val) <= DATE_CONFIG.year.max, {
    message: `年は${DATE_CONFIG.year.max}以下で入力してください`,
  });

export const zodMonth = z
  .string()
  .refine((val) => val === "" || !isNaN(Number(val)), { message: "月は数値で入力してください" })
  .refine((val) => val === "" || Number(val) >= DATE_CONFIG.month.min, {
    message: `月は${DATE_CONFIG.month.min}以上で入力してください`,
  })
  .refine((val) => val === "" || Number(val) <= DATE_CONFIG.month.max, {
    message: `月は${DATE_CONFIG.month.max}以下で入力してください`,
  });

export const zodDay = z
  .string()
  .refine((val) => val === "" || !isNaN(Number(val)), { message: "日は数値で入力してください" })
  .refine((val) => val === "" || Number(val) >= DATE_CONFIG.day.min, {
    message: `日は${DATE_CONFIG.day.min}以上で入力してください`,
  })
  .refine((val) => val === "" || Number(val) <= DATE_CONFIG.day.max, {
    message: `日は${DATE_CONFIG.day.max}以下で入力してください`,
  });

export const zodDateValue = z.object({
  year: zodYear,
  month: zodMonth,
  day: zodDay,
});

export const zodMonthValue = z.object({
  year: zodYear,
  month: zodMonth,
});

export const zodYearValue = z.object({
  year: zodYear,
});

export const zodDateRangeValue = z.object({
  from: zodDateValue,
  to: zodDateValue,
});

export const zodMonthRangeValue = z.object({
  from: zodMonthValue,
  to: zodMonthValue,
});

export const zodYearRangeValue = z.object({
  from: zodYearValue,
  to: zodYearValue,
});
