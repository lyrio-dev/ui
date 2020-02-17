import React from "react";
import { Icon, SemanticICONS } from "semantic-ui-react";

import style from "./StatusText.module.less";

import { SubmissionStatusAll } from "@/interfaces/SubmissionStatus";

interface StatusTextProps {
  status: string;
}

const icons: Record<SubmissionStatusAll, SemanticICONS> = {
  Pending: "hourglass half",
  ConfigurationError: "code",
  SystemError: "server",
  CompilationError: "code",
  FileError: "file outline",
  RuntimeError: "bomb",
  TimeLimitExceeded: "clock",
  MemoryLimitExceeded: "microchip",
  OutputLimitExceeded: "print",
  InvalidInteraction: "ban",
  PartiallyCorrect: "minus",
  WrongAnswer: "remove",
  Accepted: "checkmark",
  JudgementFailed: "server",
  Waiting: "hourglass half",
  Compiling: "spinner",
  Running: "spinner",
  Skipped: "fast forward"
};

const StatusText: React.FC<StatusTextProps> = props => {
  const text = props.status.replace(/([A-Z])/g, " $1").trimLeft();
  return (
    <span className={"statuscolor " + style[props.status]}>
      <Icon className={"statusicon" + " " + style.icon} name={icons[props.status]} />
      <span className="statustext">{text}</span>
    </span>
  );
};

export default StatusText;
