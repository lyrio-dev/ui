import { useIntl } from "react-intl";

export function useIntlMessage() {
  const intl = useIntl();
  return (id: string, values?: Record<string, string>) =>
    intl.formatMessage(
      {
        id
      },
      values
    );
}
