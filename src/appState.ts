import { observable, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { create, persist } from "mobx-persist";

import { Locale } from "./interfaces/Locale";

function getBrowserLocale(): Locale {
  const supportedLocales: string[] = Object.values(Locale);
  return (
    (navigator.languages.map(s => s.replace("-", "_")).find(locale => supportedLocales.includes(locale)) as Locale) ||
    Locale.en_US
  );
}

export const browserDefaultLocale = getBrowserLocale();

export class AppState {
  constructor() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    });
  }

  @observable
  windowWidth: number = window.innerWidth;
  @observable
  windowHeight: number = window.innerHeight;

  isScreenWidthIn = computedFn(function(this: AppState, l: number, r: number) {
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
  currentUserPrivileges: ApiTypes.GetCurrentUserAndPreferenceResponseDto["userPrivileges"] = [];

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
