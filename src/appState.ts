import { observable, computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { create, persist } from "mobx-persist";

import { Locale } from "./interfaces/Locale";
import { NavButtonName } from "./layouts/AppLayout";

import { defaultLightTheme, defaultDarkTheme, themeList } from "./themes";

function getBrowserLocale(): Locale {
  const supportedLocales: string[] = Object.values(Locale);
  return (
    ((navigator.languages || [navigator.language])
      .map(s => s.replace("-", "_"))
      .find(locale => supportedLocales.includes(locale)) as Locale) || Locale.en_US
  );
}

export const browserDefaultLocale = getBrowserLocale();

export class AppState {
  constructor() {
    makeObservable(this);
    this.initializationThemeDetection();
  }

  /* Begin current page info */

  // The current page's title
  @observable
  title: string = "";

  // Some pages doesn't support responsive layout, set this to false to display PC page on mobile
  @observable
  responsiveLayout: boolean = true;

  @observable
  activeNavButton: NavButtonName;

  enterNewPage(title: string, activeNavButton: NavButtonName = null, responsiveLayout: boolean = true) {
    this.title = title;
    this.responsiveLayout = responsiveLayout;
    this.activeNavButton = activeNavButton;
  }

  /* End current page info */

  /* Begin localization info */

  // The locale set by user on the page footer, saved in current browser
  @persist
  @observable
  localLocale: Locale = null;

  @computed
  get locale(): Locale {
    if (this.localLocale && this.localLocale === (this.userPreference.locale?.system || browserDefaultLocale)) {
      setTimeout(() => (this.localLocale = null), 0);
    }
    return this.localLocale || (this.userPreference.locale?.system as Locale) || browserDefaultLocale;
  }

  @computed
  get contentLocale(): Locale {
    return (this.userPreference.locale?.content as Locale) || this.locale;
  }

  /* End localization info */

  /* Begin theme info */

  initializationThemeDetection() {
    const mediaQueryList = window.matchMedia("only screen and (prefers-color-scheme: dark)");

    const onChange = (e: { matches: boolean }) =>
      (this.browserPreferredTheme = e.matches ? defaultDarkTheme : defaultLightTheme);
    onChange(mediaQueryList);

    if (mediaQueryList.addEventListener) mediaQueryList.addEventListener("change", onChange);
    else mediaQueryList.addListener(onChange);
  }

  @observable
  browserPreferredTheme: string;

  // This is set if the user change theme but not saved yet
  @observable
  temporaryThemeOverride?: string;

  @computed
  get theme(): string {
    const themeSelector = (this.temporaryThemeOverride ?? this.userPreference?.theme) || "auto";
    return themeSelector !== "auto" && themeSelector in themeList ? themeSelector : this.browserPreferredTheme;
  }

  @computed
  get appLogoThemed(): { src: string; style: React.CSSProperties } {
    const logoSelector = this.serverPreference.misc.appLogoForTheme[this.theme] || "original";
    const logoUrlSelector =
      logoSelector === "original" || logoSelector === "inverted"
        ? window.appLogo || this.serverPreference.misc.appLogo
        : logoSelector;
    const logoUrl = logoUrlSelector === "default" ? null : logoUrlSelector;
    const logoInverted = logoSelector === "inverted";
    return logoUrl
      ? {
          src: logoUrl,
          style: logoInverted
            ? {
                filter: "invert(1)"
              }
            : {}
        }
      : null;
  }

  /* End theme info */

  // TODO: move it out of global app state
  @persist
  @observable
  showTagsInProblemSet: boolean = false;

  /* Begin session info */

  @persist
  @observable
  token: string = "";

  @persist
  @observable
  logout = false;

  @observable
  currentUser: ApiTypes.UserMetaDto = null;

  @observable
  currentUserJoinedGroupsCount: number = 0;

  @observable
  currentUserPrivileges: ApiTypes.GetSessionInfoResponseDto["userPrivileges"] = [];

  currentUserHasPrivilege = computedFn(function (
    this: AppState,
    privilege: ApiTypes.GetSessionInfoResponseDto["userPrivileges"][0]
  ) {
    return this.currentUser && (this.currentUser.isAdmin || this.currentUserPrivileges.includes(privilege));
  });

  @observable
  userPreference: ApiTypes.UserPreferenceDto = {};

  /* End session info */

  /* Begin server info */

  @observable
  serverPreference: ApiTypes.PreferenceConfig = null;

  @observable
  serverVersion: ApiTypes.ServerVersionDto = null;

  /* End server info */
}

const hydrate = create({
  storage: localStorage,
  jsonify: true
});

export const appState = new AppState();
(window as any)._appState = appState;

export const initAppStateStore = async () => await hydrate("appState", appState);
