import { z } from "zod";
import ja from "zod/v4/locales/ja.js";
import {
  zodDateValue,
  zodMonthValue,
  zodYearValue,
  zodDateRangeValue,
  zodMonthRangeValue,
  zodYearRangeValue,
} from "@/lib/schemas/date-schemas";
import { getMonthsDiff, getYearsDiff, isWithinYears } from "@/lib/date-utils";

z.config(ja());

const CONFIG = {
  range: {
    date: { maxYears: 1 },
    month: { maxMonths: 12 },
    year: { maxYears: 1 },
  },
};

const baseParamSchema = z.object({
  required: z.boolean(),
  type: z.unknown(),
  value: z.unknown(),
  readonly: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const textParamSchema = baseParamSchema
  .extend({
    type: z.literal("text"),
    value: z.object({
      text: z.string(),
    }),
  })
  .refine((data) => !data.required || data.value.text.length > 0, {
    message: "テキストを入力してください",
    path: ["value", "text"],
  });

const dateParamSchema = baseParamSchema
  .extend({
    type: z.literal("date"),
    value: zodDateValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      return data.value.year && data.value.month && data.value.day;
    },
    {
      message: "日付を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue = data.value.year || data.value.month || data.value.day;
      const hasAllValues = data.value.year && data.value.month && data.value.day;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "日付を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  );

const monthParamSchema = baseParamSchema
  .extend({
    type: z.literal("month"),
    value: zodMonthValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      return data.value.year && data.value.month;
    },
    {
      message: "年月を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue = data.value.year || data.value.month;
      const hasAllValues = data.value.year && data.value.month;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "年月を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  );

const yearParamSchema = baseParamSchema
  .extend({
    type: z.literal("year"),
    value: zodYearValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      return !!data.value.year;
    },
    { message: "年を入力してください", path: ["value"] }
  );

const dateRangeParamSchema = baseParamSchema
  .extend({
    type: z.literal("date_range"),
    value: zodDateRangeValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      const hasAllValues =
        data.value.from.year &&
        data.value.from.month &&
        data.value.from.day &&
        data.value.to.year &&
        data.value.to.month &&
        data.value.to.day;
      return hasAllValues;
    },
    {
      message: "日付範囲を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue =
        data.value.from.year ||
        data.value.from.month ||
        data.value.from.day ||
        data.value.to.year ||
        data.value.to.month ||
        data.value.to.day;
      const hasAllValues =
        data.value.from.year &&
        data.value.from.month &&
        data.value.from.day &&
        data.value.to.year &&
        data.value.to.month &&
        data.value.to.day;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "日付範囲を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (
        !data.value.from.year ||
        !data.value.from.month ||
        !data.value.from.day ||
        !data.value.to.year ||
        !data.value.to.month ||
        !data.value.to.day
      ) {
        return true;
      }
      return isWithinYears(data.value.from, data.value.to, CONFIG.range.date.maxYears);
    },
    {
      message: `範囲は${CONFIG.range.date.maxYears}年以内で入力してください`,
      path: ["value"],
    }
  );

const monthRangeParamSchema = baseParamSchema
  .extend({
    type: z.literal("month_range"),
    value: zodMonthRangeValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      const hasAllValues = data.value.from.year && data.value.from.month && data.value.to.year && data.value.to.month;
      return hasAllValues;
    },
    {
      message: "年月範囲を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue = data.value.from.year || data.value.from.month || data.value.to.year || data.value.to.month;
      const hasAllValues = data.value.from.year && data.value.from.month && data.value.to.year && data.value.to.month;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "年月範囲を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (!data.value.from.year || !data.value.from.month || !data.value.to.year || !data.value.to.month) {
        return true;
      }
      const monthsDiff = getMonthsDiff(data.value.from, data.value.to);
      if (monthsDiff === null) return false;
      return monthsDiff <= CONFIG.range.month.maxMonths;
    },
    {
      message: `範囲は${CONFIG.range.month.maxMonths}ヶ月以内で入力してください`,
      path: ["value"],
    }
  );

const yearRangeParamSchema = baseParamSchema
  .extend({
    type: z.literal("year_range"),
    value: zodYearRangeValue,
  })
  .refine(
    (data) => {
      if (!data.required) return true;
      const hasAllValues = data.value.from.year && data.value.to.year;
      return hasAllValues;
    },
    {
      message: "年範囲を入力してください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      const hasAnyValue = data.value.from.year || data.value.to.year;
      const hasAllValues = data.value.from.year && data.value.to.year;
      if (!hasAnyValue) return true;
      return hasAllValues;
    },
    {
      message: "年範囲を完全に入力するか、すべてクリアしてください",
      path: ["value"],
    }
  )
  .refine(
    (data) => {
      if (!data.value.from.year || !data.value.to.year) {
        return true;
      }
      const yearsDiff = getYearsDiff(data.value.from, data.value.to);
      if (yearsDiff === null) return false;
      return yearsDiff <= CONFIG.range.year.maxYears;
    },
    {
      message: `範囲は${CONFIG.range.year.maxYears}年以内で入力してください`,
      path: ["value"],
    }
  );

export const paramSchema = z.union([
  textParamSchema,
  dateParamSchema,
  monthParamSchema,
  yearParamSchema,
  dateRangeParamSchema,
  monthRangeParamSchema,
  yearRangeParamSchema,
]);

export const conditionSchema = z.object({
  params: z.array(paramSchema).min(1, { message: "少なくとも1つのパラメータが必要です" }),
  readonly: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const formSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  description: z.string().min(1, { message: "概要は必須です" }),
  conditions: z.array(conditionSchema).min(1, { message: "少なくとも1つの条件が必要です" }),
});
