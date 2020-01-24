export default function formatFileSize(size: number, precision: number = 2) {
  const units = ["K", "M", "G", "T"];

  let unit = "B";
  for (const currUnit of units) {
    if (size > 1024) {
      size /= 1024;
      unit = currUnit;
    }
  }

  const fixed = size === Math.round(size) ? size.toString() : size.toFixed(precision);
  return fixed + " " + unit;
}
