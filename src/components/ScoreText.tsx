import React from "react";

import style from "./ScoreText.module.less";

interface ScoreTextProps {
  score: number;
}

const ScoreText: React.FC<ScoreTextProps> = props => {
  return <span className={style["score_" + Math.floor(props.score / 10)]}>{props.score}</span>;
};

export default ScoreText;

export function getScoreColor(score: number | string): string {
  return [
    "#ff4f4f",
    "#ff694f",
    "#f8603a",
    "#fc8354",
    "#fa9231",
    "#f7bb3b",
    "#ecdb44",
    "#e2ec52",
    "#b0d628",
    "#93b127",
    "#25ad40"
  ][Math.floor((Number(score) || 0) / 10)];
}
