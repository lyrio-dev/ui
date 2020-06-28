import React from "react";
import { useIntl } from "react-intl";
import { unescapeLocalizedMessage } from "@/locales";

export function useIntlMessage() {
  const removeToBeTranslatedTag = (s: string) => (s.startsWith("[TBT] ") ? s.replace("[TBT] ", "") : s);
  const intl = useIntl();
  return Object.assign(
    (id: string, values?: Record<React.ReactText, React.ReactText> | React.ReactText[]) =>
      removeToBeTranslatedTag(
        unescapeLocalizedMessage(
          intl.formatMessage(
            {
              id
            },
            values as Record<string, string>
          )
        )
      ),
    intl
  );
}
