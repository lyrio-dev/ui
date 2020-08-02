import { observable, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { create, persist } from "mobx-persist";

import { Locale } from "./interfaces/Locale";

function getBrowserLocale(): Locale {
  const supportedLocales: string[] = Object.values(Locale);
  return (
    ((navigator.languages || [navigator.language])
      .map(s => s.replace("-", "_"))
      .find(locale => supportedLocales.includes(locale)) as Locale) || Locale.en_US
  );
}

const isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const browserDefaultLocale = getBrowserLocale();

export class AppState {
  constructor() {
    // iOS's Mobile Safari won't trigger "resize" event when the <meta name="viewport"> tag is added

    const refreshWindowSize = () => {
      if (this.windowWidth !== window.innerWidth) this.windowWidth = window.innerWidth;
      if (this.windowHeight !== window.innerHeight) this.windowHeight = window.innerHeight;
    };

    if (isMobileSafari) {
      const continueRefreshWindowSize = () => {
        refreshWindowSize();
        window.requestAnimationFrame(continueRefreshWindowSize);
      };
      continueRefreshWindowSize();
    } else window.addEventListener("resize", refreshWindowSize);
  }

  @observable
  windowWidth: number = window.innerWidth;
  @observable
  windowHeight: number = window.innerHeight;

  isScreenWidthIn = computedFn(function (this: AppState, l: number, r: number) {
    return this.windowWidth >= l && this.windowWidth < r;
  });

  // The current page's title
  @observable
  title: string = "";

  // Some pages doesn't support responsive layout, set this to false to display PC page on mobile
  @observable
  responsiveLayout: boolean = true;

  enterNewPage(title: string, responsiveLayout: boolean = true) {
    this.title = title;
    this.responsiveLayout = responsiveLayout;
  }

  // The locale set by user on the page footer, saved in current browser
  @persist
  @observable
  localLocale: Locale = null;

  @computed
  get locale(): Locale {
    if (this.localLocale && this.localLocale === (this.userPreference.systemLocale || browserDefaultLocale)) {
      setTimeout(() => (this.localLocale = null), 0);
    }
    return this.localLocale || (this.userPreference.systemLocale as Locale) || browserDefaultLocale;
  }

  @computed
  get contentLocale(): Locale {
    return (this.userPreference.contentLocale as Locale) || this.locale;
  }

  @persist
  @observable
  token: string = "";

  @persist
  @observable
  showTagsInProblemSet: boolean = false;

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

  @observable
  serverPreference: ApiTypes.PreferenceConfig = null;
}

const hydrate = create({
  storage: localStorage,
  jsonify: true
});

export const appState = new AppState();
(window as any)._appState = appState;

export const initAppStateStore = async () => await hydrate("appState", appState);
