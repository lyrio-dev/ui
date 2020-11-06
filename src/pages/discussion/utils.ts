export function getDiscussionDisplayTitle(title: string, _: (id: string) => string) {
  return title.trim() || _("discussions.no_title");
}

export function getDiscussionUrl(meta: ApiTypes.DiscussionMetaDto) {
  return `/d/${meta.id}`;
}
