import React from "react";

export default function formatDateTime(date: Date | string) {
  if (!(date instanceof Date)) date = new Date(date);
  let month = date.getMonth().toString();
  let day = date.getDate().toString();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();

  month = month.length === 1 ? "0" + month : month;
  day = day.length === 1 ? "0" + day : day;
  hour = hour.length === 1 ? "0" + hour : hour;
  minute = minute.length === 1 ? "0" + minute : minute;
  second = second.length === 1 ? "0" + second : second;

  const withoutYear = (
    <>
      {`${month}/${day}`}&nbsp;&nbsp;{`${hour}:${minute}:${second}`}
    </>
  );
  const withYear = `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
  return [withoutYear, withYear];
}
