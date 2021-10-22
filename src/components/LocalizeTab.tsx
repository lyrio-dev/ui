import React, { PropsWithChildren, useState } from "react";

import style from "./LocalizeTab.module.less";

import { Locale } from "@/interfaces/Locale";
import { Dropdown, Flag, Menu, Tab } from "semantic-ui-react";
import localeMeta from "@/locales/meta";
import { useLocalizer } from "@/utils/hooks";

interface LocalizeTabProps<T> {
  className?: string;
  defaultActiveLocale?: Locale;
  localizedContents: Record<Locale, T>;
  pending?: boolean;
  setLocalizedContents: React.Dispatch<React.SetStateAction<Record<Locale, T>>>;
  setModified?: (confirm: boolean) => void;
  item: (locale: Locale, content: T, setDefaultLocale?: () => void, deleteLocale?: () => void) => React.ReactNode;
  defaultLocalizedContent: T | ((locale?: Locale) => T);
}

export function LocalizeTab<T>(props: PropsWithChildren<LocalizeTabProps<T>>) {
  const _ = useLocalizer("language");

  const [activeIndex, setActiveIndex] = useState(() => {
    const index = Object.keys(props.localizedContents).indexOf(props.defaultActiveLocale);
    return index === -1 ? 0 : index;
  });

  const locales = Object.keys(props.localizedContents) as Locale[];

  function setDefaultLocale(locale: Locale) {
    if (props.pending) return;

    const currentDefaultLocale = locales[0];
    if (locale === currentDefaultLocale) return;

    props.setLocalizedContents(
      l =>
        Object.fromEntries([[locale, l[locale]], ...Object.entries(l).filter(([key]) => key !== locale)]) as Record<
          Locale,
          T
        >
    );
    setActiveIndex(0);
    props.setModified?.(true);
  }

  function deleteLocale(locale: Locale) {
    if (props.pending) return;

    if (activeIndex === Object.keys(props.localizedContents).length - 1)
      setActiveIndex(Object.keys(props.localizedContents).length - 2);
    props.setLocalizedContents(
      l => Object.fromEntries(Object.entries(l).filter(([key]) => key !== locale)) as Record<Locale, T>
    );
    props.setModified?.(true);
  }

  function addLocale(locale: Locale) {
    if (props.pending) return;

    props.setLocalizedContents(l => ({
      ...l,
      [locale]:
        typeof props.defaultLocalizedContent === "function"
          ? (props.defaultLocalizedContent as (locale: Locale) => T)(locale)
          : props.defaultLocalizedContent
    }));
    setActiveIndex(Object.keys(props.localizedContents).length);
    props.setModified?.(true);
  }

  return (
    <Tab
      className={props.className}
      activeIndex={activeIndex}
      onTabChange={(e, { activeIndex: newActiveIndex }) =>
        newActiveIndex !== locales.length && setActiveIndex(newActiveIndex as number)
      }
      menu={{ pointing: true }}
      panes={[
        ...locales.map((locale, i) => ({
          menuItem: (
            <Menu.Item key={locale}>
              <Flag name={localeMeta[locale].flag as any} />
              {_(`.${locale}`)}
            </Menu.Item>
          ),
          pane: {
            key: locale,
            className: style.localeTabPane,
            content: props.item(
              locale,
              props.localizedContents[locale],
              i === 0 ? null : () => setDefaultLocale(locale),
              locales.length === 1 ? null : () => deleteLocale(locale)
            )
          }
        })),
        {
          menuItem: (
            <Dropdown
              key="add"
              item
              icon="add"
              // Fix Semantic UI attempts to pass a active={false} to this menu item
              active=""
              disabled={locales.length === Object.keys(localeMeta).length}
              className={`icon ${style.toolbarMenuIconItem}`}
            >
              <Dropdown.Menu>
                {Object.keys(localeMeta)
                  .filter((locale: Locale) => !locales.includes(locale))
                  .map((locale: Locale) => (
                    <Dropdown.Item
                      key={locale}
                      flag={localeMeta[locale].flag}
                      text={_(`.${locale}`)}
                      onClick={() => addLocale(locale)}
                    />
                  ))}
              </Dropdown.Menu>
            </Dropdown>
          ),
          pane: {
            key: "add",
            content: null
          }
        }
      ]}
      renderActiveOnly={false}
    />
  );
}
