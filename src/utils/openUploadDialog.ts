export default function openUploadDialog(callback: (files: File[]) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.onchange = () => callback(Array.from(input.files));
  input.click();
}
