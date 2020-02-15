import React from "react";

import style from "./ScoreText.module.less";

interface ScoreTextProps {
  score: number;
}

const ScoreText: React.FC<ScoreTextProps> = props => {
  return <span className={style["score_" + Math.floor(props.score / 10)]}>{props.score}</span>;
};

export default ScoreText;
