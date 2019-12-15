import { observable } from "mobx";
import { create, persist } from "mobx-persist";

import { UserMeta } from "./interfaces/UserMeta";

export class AppState {
  @persist
  @observable
  locale: string = "zh-CN";

  @persist
  @observable
  token: string = "";

  @observable
  title: string = "";

  @observable
  loggedInUser: UserMeta = null;

  @observable
  loginRedirectUrl: string = null;
}

const hydrate = create({
  storage: localStorage,
  jsonify: true
});

export const appState = new AppState();
(window as any)._appState = appState;

export const initAppStateStore = async () => await hydrate("appState", appState);
