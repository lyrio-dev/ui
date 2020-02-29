export const tagColors = [
  "red",
  "blue",
  "black",
  "purple",
  "orange",
  "yellow",
  "pink",
  "green",
  "olive",
  "teal",
  "violet"
];

interface ProblemTagLike {
  color: string;
  name: string;
}

export function sortTagColors(tagColors: string[]) {
  return tagColors.sort((a, b) => tagColors.indexOf(a) - tagColors.indexOf(b));
}

export function sortTags<T extends ProblemTagLike>(tags: T[]) {
  return tags.sort((a, b) => {
    if (a.color != b.color) return tagColors.indexOf(a.color) - tagColors.indexOf(b.color);
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}
