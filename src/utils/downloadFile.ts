export default function downloadFile(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.click();
}
