// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
export default async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {}

  const textArea = document.createElement("textarea");

  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const success = document.execCommand("copy");

  document.body.removeChild(textArea);

  return success;
}
