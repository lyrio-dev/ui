import React from "react";

import formatDateTime from "@/utils/formatDateTime";

interface TimeProps {
  date: Date | string | number;
}

export const Time: React.FC<TimeProps> = props => {
  const [withoutYear, full] = formatDateTime(props.date);
  return <span title={full} children={withoutYear} />;
}
