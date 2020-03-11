import { observable, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { create, persist } from "mobx-persist";

import { UserMeta } from "./interfaces/UserMeta";
import { Locale } from "./interfaces/Locale";

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

  @persist
  @observable
  locale: Locale = Locale.zh_CN;

  @computed
  get localeHyphen(): string {
    return this.locale.replace("_", "-");
  }

  @persist
  @observable
  token: string = "";

  @persist
  @observable
  showTagsInProblemSet: boolean = false;

  @observable
  loggedInUser: UserMeta = null;
}

const hydrate = create({
  storage: localStorage,
  jsonify: true
});

export const appState = new AppState();
(window as any)._appState = appState;

export const initAppStateStore = async () => await hydrate("appState", appState);
