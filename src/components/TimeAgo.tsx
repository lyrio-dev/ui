import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import * as timeago from "timeago.js";

import formatDateTime from "@/utils/formatDateTime";
import { appState } from "@/appState";

interface TimeAgoProps {
  time: Date | string | number;
  dateOnly?: boolean;
}

function fixLater(time: Date, relative: Date) {
  // Accept the client's time is <= 1 minute slower than server's time
  if (time >= relative) return new Date(+time - Math.min(+time - +relative + 1, 60 * 1000));
  return time;
}

let TimeAgo: React.FC<TimeAgoProps> = props => {
  // Update per 30s
  const UPDATE_INTERVAL = 30 * 1000;

  // Use time ago if within 30 days
  const MAX_TIME_AGO = 30 * 24 * 60 * 60 * 1000;

  const [relativeDate, setRelativeDate] = useState(new Date());

  const time = new Date(props.time);
  const getUseTimeAgo = () => +relativeDate - +time <= MAX_TIME_AGO;
  const [useTimeAgo, setUseTimeAgo] = useState(getUseTimeAgo());

  useEffect(() => {
    if (useTimeAgo) {
      const id = setInterval(() => setRelativeDate(new Date()), UPDATE_INTERVAL);
      return () => clearInterval(id);
    }
  }, [useTimeAgo]);

  useEffect(() => {
    if (getUseTimeAgo() !== useTimeAgo) setUseTimeAgo(!useTimeAgo);
  }, [relativeDate, time]);

  const fullDateTime = formatDateTime(time, props.dateOnly)[1];

  return (
    <>
      {useTimeAgo ? (
        <span title={fullDateTime}>
          {timeago.format(fixLater(time, relativeDate), appState.locale, {
            relativeDate: relativeDate
          })}
        </span>
      ) : (
        fullDateTime
      )}
    </>
  );
};

TimeAgo = observer(TimeAgo);

export default TimeAgo;
