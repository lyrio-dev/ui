import React from "react";

export default function formatDateTime(
  date: Date | string | number,
  dateOnly?: boolean
): [JSX.Element | string, string] {
  if (!(date instanceof Date)) date = new Date(date);
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();

  month = month.length === 1 ? "0" + month : month;
  day = day.length === 1 ? "0" + day : day;
  hour = hour.length === 1 ? "0" + hour : hour;
  minute = minute.length === 1 ? "0" + minute : minute;
  second = second.length === 1 ? "0" + second : second;

  const withoutYearDateOnly = `${month}/${day}`;
  const withoutYear = dateOnly ? (
    withoutYearDateOnly
  ) : (
    <>
      {withoutYearDateOnly}&nbsp;&nbsp;{`${hour}:${minute}:${second}`}
    </>
  );

  const withYearDateOnly = `${date.getFullYear()}-${month}-${day}`;
  const withYear = dateOnly ? withYearDateOnly : `${withYearDateOnly} ${hour}:${minute}:${second}`;

  return [withoutYear, withYear];
}

export function friendlyFormatDateTime(date: Date | string | number): [string | JSX.Element, string] {
  if (!(date instanceof Date)) date = new Date(date);

  const now = new Date();
  const dateOnlyAndWithYear = date.getFullYear() !== now.getFullYear();

  return [formatDateTime(date, dateOnlyAndWithYear)[dateOnlyAndWithYear ? 1 : 0], formatDateTime(date)[1]];
}
