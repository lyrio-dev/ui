function isEnterPressed(e: React.KeyboardEvent<HTMLInputElement>) {
  if ("key" in e) return e.key === "Enter";
  if ("keyCode" in e)
    // @ts-ignore
    return e.keyCode === 13;

  // This shouldn't happen
  return false;
}

export function onEnterPress(onEnterPressHandler: () => void) {
  return (e: React.KeyboardEvent<HTMLInputElement>) =>
    onEnterPressHandler && isEnterPressed(e) && onEnterPressHandler();
}
