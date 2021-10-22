export function getContestDisplayName(name: string, _: (id: string) => string) {
  return name.trim() || _("contests.no_name");
}

export function getContestUrl(metaOrId: ApiTypes.ContestMetaDto | number, subRoute?: string) {
  return `/c/${typeof metaOrId === "number" ? metaOrId : metaOrId.id}` + (subRoute ? `/${subRoute}` : "");
}
