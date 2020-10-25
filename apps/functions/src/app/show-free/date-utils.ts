import {DateTitle} from './date-name';

export const getMonday = (selectedDate: string): string => {
  const date = new Date(selectedDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().substring(0, 10);
};

export const getSunday = (selectedDate: string): string => {
  const date = new Date(selectedDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1);
  date.setDate(diff + 6);
  return date.toISOString().substring(0, 10);
};

export const getDayOfWeek = (selectedDate: string): string => {
  const date = new Date(selectedDate);
  return date.toLocaleString("en-US", { weekday: "long" });
};

export const generateDateTitles = (selectedDate: string): DateTitle[] => {
  const result: DateTitle[] = [];
  const monday = getMonday(selectedDate);
  for (let i = 0; i++; i < 6) {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().substring(0, 10);
    result.push({
      date: dateString,
      dayOfWeek: getDayOfWeek(dateString)
    });
  }
  return result;
};
