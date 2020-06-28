import React from "react";
import { useIntl } from "react-intl";
import { unescapeLocalizedMessage } from "@/locales";

/**
 * Return a react-intl function & object.
 *
 * If the result is used as a function, and `defaultModuleName` is passed, then the leading
 * `defaultModuleName` in the message id could be omitted.
 * e.g. `"problem.header.title"` could be `".header.title"`
 *
 * @param defaultModuleName The default module name of localized message.
 */
export function useIntlMessage(defaultModuleName?: string) {
  const removeToBeTranslatedTag = (s: string) => (s.startsWith("[TBT] ") ? s.replace("[TBT] ", "") : s);
  const intl = useIntl();
  return Object.assign(
    (id: string, values?: Record<React.ReactText, React.ReactText> | React.ReactText[]) =>
      removeToBeTranslatedTag(
        unescapeLocalizedMessage(
          intl.formatMessage(
            {
              id: id.startsWith(".") ? defaultModuleName + id : id
            },
            values as Record<string, string>
          )
        )
      ),
    intl
  );
}
