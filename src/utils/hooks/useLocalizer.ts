import { useIntl } from "react-intl";

import { Localizer, unescapeLocalizedMessage } from "@/locales";

/**
 * Return a react-intl function & object.
 *
 * If the result is used as a function, and `defaultModuleName` is passed, then the leading
 * `defaultModuleName` in the message id could be omitted.
 * e.g. `"problem.header.title"` could be `".header.title"`
 *
 * @param defaultModuleName The default module name of localized message.
 */
export function useLocalizer(defaultModuleName?: string) {
  const intl = useIntl();
  const localizer: Localizer = (messageId, paramaters) =>
    unescapeLocalizedMessage(
      intl.formatMessage(
        {
          id: messageId.startsWith(".") ? defaultModuleName + messageId : messageId
        },
        paramaters as Record<string, string>
      )
    );

  return Object.assign(localizer, intl);
}
