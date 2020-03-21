import { appState, initAppStateStore } from "@/appState";

import { AuthApi } from "@/api";

export default async function initApp() {
  await initAppStateStore();

  if (appState.token) {
    // Get current logged in user's meta
    const { requestError, response } = await AuthApi.getCurrentUserAndPreference();
    appState.loggedInUser = response.userMeta;
    appState.userPreference = response.userPreference;
    appState.serverPreference = response.serverPreference;
  }
}
