import api from "@/services/api";

export default {
  namespace: "app",
  state: {
    locale: "zh-CN",
    title: "SYZOJ",
    siteInfo: window.syzojSiteInfo,
    loggedIn: false,
    loggedInUser: {
      username: null,
      avatar: null
    },
    loginRedirectUrl: null
  },
  reducers: {
    setLoggedIn(state, { payload: { loggedIn, loggedInUser }}) {
      return {
        ...state,
        loggedIn,
        loggedInUser
      };
    },
    setLocale(state, { payload: { locale } }) {
      return {
        ...state,
        locale
      };
    },
    setTitle(state, { payload: { title } }) {
      return {
        ...state,
        title
      };
    },
    setSiteInfo(state, { payload: { siteInfo } }) {
      return {
        ...state,
        siteInfo
      };
    },
    setLoginRedirectUrl(state, { payload: { loginRedirectUrl } }) {
      return {
        ...state,
        loginRedirectUrl
      };
    }
  },
  effects: {
    *logout({ payload }, { call, put }) {
      const response = yield call(api.post, "logout");

      yield put({
        type: "setLoggedIn",
        payload: {
          loggedIn: false,
          loggedInUser: {
            username: null,
            avatar: null
          }
        }
      });
    }
  }
};
