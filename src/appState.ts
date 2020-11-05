import { observable, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { create, persist } from "mobx-persist";

import { Locale } from "./interfaces/Locale";
import { NavButtonName } from "./layouts/AppLayout";

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

  @persist
  @observable
  token: string = "";

  @persist
  @observable
  showTagsInProblemSet: boolean = false;

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

  @observable
  serverPreference: ApiTypes.PreferenceConfig = null;

  @observable
  serverVersion: ApiTypes.ServerVersionDto = null;
}

const hydrate = create({
  storage: localStorage,
  jsonify: true
});

export const appState = new AppState();
(window as any)._appState = appState;

export const initAppStateStore = async () => await hydrate("appState", appState);
