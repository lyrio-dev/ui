import { Localizer } from "@/locales";

export function getProblemUrl(
  meta: ApiTypes.ProblemMetaDto,
  options?: { subRoute?: string; use?: "id" | "displayId" }
): string;

export function getProblemUrl(id: number, options?: { subRoute?: string; use?: "id" | "displayId" }): string;

export function getProblemUrl(
  metaOrId: ApiTypes.ProblemMetaDto | number,
  { subRoute, use }: { subRoute?: string; use?: "id" | "displayId" } = {}
) {
  return (
    (typeof metaOrId === "number"
      ? use === "displayId"
        ? `/p/${metaOrId}`
        : `/p/id/${metaOrId}`
      : (!use && metaOrId.displayId) || use === "displayId"
      ? `/p/${metaOrId.displayId}`
      : `/p/id/${metaOrId.id}`) + (subRoute ? `/${subRoute}` : "")
  );
}

export function getProblemIdString(
  meta: ApiTypes.ProblemMetaDto,
  options?: { hideHashTagOnDisplayId?: boolean; use?: "id" | "displayId" }
): string;

export function getProblemIdString(
  id: number,
  options?: { hideHashTagOnDisplayId?: boolean; use?: "id" | "displayId" }
): string;

export function getProblemIdString(
  metaOrId: ApiTypes.ProblemMetaDto | number,
  { hideHashTagOnDisplayId, use }: { hideHashTagOnDisplayId?: boolean; use?: "id" | "displayId" } = {}
): string {
  return typeof metaOrId === "number"
    ? use === "displayId"
      ? `${hideHashTagOnDisplayId ? "" : "#"}${metaOrId}`
      : `P${metaOrId}`
    : (!use && metaOrId.displayId) || use === "displayId"
    ? `${hideHashTagOnDisplayId ? "" : "#"}${metaOrId.displayId}`
    : `P${metaOrId.id}`;
}

export function getProblemDisplayName(
  meta: ApiTypes.ProblemMetaDto,
  title: string,
  _: Localizer,
  returnType: "tuple"
): [string, string, string];

export function getProblemDisplayName(
  meta: ApiTypes.ProblemMetaDto,
  title: string,
  _: Localizer,
  returnType?: "all" | "titleOnly"
): string;

export function getProblemDisplayName(
  meta: ApiTypes.ProblemMetaDto,
  title: string,
  _: Localizer,
  returnType?: "all" | "tuple" | "titleOnly"
): string | [string, string, string] {
  const idString = meta && (meta.displayId ? `#${meta.displayId}` : `P${meta.id}`);
  const titleString = title.trim() || _("problem_set.no_title");
  const all = idString ? `${idString}. ${titleString}` : titleString;
  switch (returnType) {
    case "tuple":
      return [idString, titleString, all];
    case "titleOnly":
      return titleString;
    case "all":
    default:
      return all;
  }
}
