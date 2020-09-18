export default function openUploadDialog(callback: (files: File[]) => void, accept?: string) {
  const input = document.createElement("input");
  input.accept = accept;
  input.type = "file";
  input.multiple = true;
  input.onchange = () => callback(Array.from(input.files));
  input.click();
}
