import React from "react";

import style from "./LocalizeTab.module.less";

import { Locale } from "@/interfaces/Locale";
import { Dropdown, Flag, Menu, Tab } from "semantic-ui-react";
import localeMeta from "@/locales/meta";
import { useLocalizer } from "@/utils/hooks";

interface LocalizeTabProps {
  className?: string;
  locales: Locale[];
  activeLocale: Locale;
  item: (locale: Locale, isDefault: boolean, isOnly: boolean) => React.ReactNode;
  onAddLocale: (locale: Locale) => void;
  onSetActiveLocale: (locale: Locale) => void;
}

export const LocalizeTab: React.FC<LocalizeTabProps> = props => {
  const _ = useLocalizer("language");

  return (
    <Tab
      className={props.className}
      activeIndex={props.locales.indexOf(props.activeLocale)}
      onTabChange={(e, { activeIndex }) =>
        activeIndex !== props.locales.length && props.onSetActiveLocale(props.locales[activeIndex])
      }
      menu={{ pointing: true }}
      panes={[
        ...props.locales.map((locale, i) => ({
          menuItem: (
            <Menu.Item key={locale}>
              <Flag name={localeMeta[locale].flag as any} />
              {_(`.${locale}`)}
            </Menu.Item>
          ),
          pane: {
            key: locale,
            className: style.localeTabPane,
            content: props.item(locale, i === 0, props.locales.length === 1)
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
              disabled={props.locales.length === Object.keys(localeMeta).length}
              className={`icon ${style.toolbarMenuIconItem}`}
            >
              <Dropdown.Menu>
                {Object.keys(localeMeta)
                  .filter((locale: Locale) => !props.locales.includes(locale))
                  .map((locale: Locale) => (
                    <Dropdown.Item
                      key={locale}
                      flag={localeMeta[locale].flag}
                      text={_(`.${locale}`)}
                      onClick={() => props.onAddLocale(locale)}
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
};
