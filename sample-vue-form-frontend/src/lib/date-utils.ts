import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// NOTE: うるう年も考慮するために適用
dayjs.extend(customParseFormat);

interface DateInput {
  year: string;
  month: string;
  day: string;
}

interface MonthInput {
  year: string;
  month: string;
}

interface YearInput {
  year: string;
}

export const isValidDate = (date: DateInput): boolean => {
  if (!date.year || !date.month || !date.day) {
    return false;
  }

  const yearNum = Number(date.year);
  const monthNum = Number(date.month);
  const dayNum = Number(date.day);

  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
    return false;
  }

  const formatted = `${date.year.padStart(4, "0")}-${monthNum}-${dayNum}`;
  const parsed = dayjs(formatted, "YYYY-M-D", true);

  return parsed.isValid();
};

export const getMonthsDiff = (from: MonthInput, to: MonthInput): number | null => {
  if (!from.year || !from.month || !to.year || !to.month) {
    return null;
  }

  const fromYearNum = Number(from.year);
  const fromMonthNum = Number(from.month);
  const toYearNum = Number(to.year);
  const toMonthNum = Number(to.month);

  if (isNaN(fromYearNum) || isNaN(fromMonthNum) || isNaN(toYearNum) || isNaN(toMonthNum)) {
    return null;
  }

  const fromFormatted = `${from.year.padStart(4, "0")}-${fromMonthNum}`;
  const toFormatted = `${to.year.padStart(4, "0")}-${toMonthNum}`;

  const fromDate = dayjs(fromFormatted, "YYYY-M", true);
  const toDate = dayjs(toFormatted, "YYYY-M", true);

  if (!fromDate.isValid() || !toDate.isValid()) {
    return null;
  }

  return toDate.diff(fromDate, "month");
};

export const getYearsDiff = (from: YearInput, to: YearInput): number | null => {
  if (!from.year || !to.year) {
    return null;
  }

  const fromNum = Number(from.year);
  const toNum = Number(to.year);

  if (isNaN(fromNum) || isNaN(toNum)) {
    return null;
  }

  return toNum - fromNum;
};

export const isWithinYears = (from: DateInput, to: DateInput, years: number): boolean => {
  if (!isValidDate(from) || !isValidDate(to)) {
    return false;
  }

  const fromMonthNum = Number(from.month);
  const fromDayNum = Number(from.day);
  const toMonthNum = Number(to.month);
  const toDayNum = Number(to.day);

  const fromFormatted = `${from.year.padStart(4, "0")}-${fromMonthNum}-${fromDayNum}`;
  const toFormatted = `${to.year.padStart(4, "0")}-${toMonthNum}-${toDayNum}`;

  const fromDate = dayjs(fromFormatted, "YYYY-M-D", true);
  const toDate = dayjs(toFormatted, "YYYY-M-D", true);

  const yearsLater = fromDate.add(years, "year");

  return toDate.isSame(yearsLater, "day") || toDate.isBefore(yearsLater, "day");
};
