export function getLimit(judgeInfo: any, limit: "timeLimit" | "memoryLimit") {
  const isValidLimit = (x: any) => Number.isSafeInteger(x) && x >= 0;

  const taskLimit = isValidLimit(judgeInfo[limit]) ? judgeInfo[limit] : Infinity;

  let min = Infinity,
    max = -Infinity;
  for (const subtask of judgeInfo.subtasks || []) {
    const subtaskLimit = isValidLimit(subtask[limit]) ? subtask[limit] : taskLimit;
    for (const testcase of subtask.testcases || []) {
      const x = isValidLimit(testcase[limit]) ? testcase[limit] : subtaskLimit;
      if (x === 0) continue;

      min = Math.min(min, x);
      max = Math.max(max, x);
    }
  }

  if (!Number.isFinite(min)) return null;

  if (min === max) return min.toString();
  return min + " - " + max;
}

export function hasAnySubtaskTestcase(judgeInfo: any) {
  return (
    Array.isArray(judgeInfo?.subtasks) &&
    judgeInfo.subtasks.some(subtask => Array.isArray(subtask?.testcases) && subtask?.testcases.length > 0)
  );
}
