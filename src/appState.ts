import { observable, computed } from "mobx";
import { create, persist } from "mobx-persist";

import { UserMeta } from "./interfaces/UserMeta";
import { Locale } from "./interfaces/Locale";

export class AppState {
  constructor() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
  }

  @observable
  windowWidth: number = window.innerWidth;

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
  title: string = "";

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
