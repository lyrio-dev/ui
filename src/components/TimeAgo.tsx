import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import * as timeago from "timeago.js";

import formatDateTime from "@/utils/formatDateTime";
import { appState } from "@/appState";

interface TimeAgoProps {
  time: Date;
  dateOnly?: boolean;
}

let TimeAgo: React.FC<TimeAgoProps> = props => {
  // Update per 30s
  const UPDATE_INTERVAL = 30 * 1000;

  // Use time ago if within 30 days
  const MAX_TIME_AGO = 30 * 24 * 60 * 60 * 1000;

  const [timeAgoRelativeDate, setTimeAgoRelativeDate] = useState(new Date());

  const getUseTimeAgo = () => +timeAgoRelativeDate - +props.time <= MAX_TIME_AGO;
  const [useTimeAgo, setUseTimeAgo] = useState(getUseTimeAgo());

  useEffect(() => {
    if (useTimeAgo) {
      const id = setInterval(() => setTimeAgoRelativeDate(new Date()), UPDATE_INTERVAL);
      return () => clearInterval(id);
    }
  }, [useTimeAgo]);

  useEffect(() => {
    if (getUseTimeAgo() !== useTimeAgo) setUseTimeAgo(!useTimeAgo);
  }, [timeAgoRelativeDate, props.time]);

  const fullDateTime = formatDateTime(props.time, props.dateOnly)[1];

  return (
    <>
      {useTimeAgo ? (
        <span title={fullDateTime}>
          {timeago.format(props.time, appState.locale, {
            relativeDate: timeAgoRelativeDate
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
