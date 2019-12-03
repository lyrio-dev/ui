import api from "@/services/api";

export default {
  namespace: "app",
  state: {
    locale: "zh-CN",
    title: "SYZOJ",
    appConfig: window._appConfig,
    loggedIn: false,
    token: null,
    loggedInUser: {
      id: null,
      username: null,
      email: null,
      bio: null
    },
    loginRedirectUrl: null
  },
  reducers: {
    setLoggedIn(state, { payload: { loggedIn, token, loggedInUser } }) {
      api.setToken(token);
      return {
        ...state,
        loggedIn,
        token,
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
    setLoginRedirectUrl(state, { payload: { loginRedirectUrl } }) {
      return {
        ...state,
        loginRedirectUrl
      };
    }
  },
  effects: {
    *getLoggedInUser({ payload }, { call, put }) {
      const token = api.getToken();
      if (!token) return;

      const { requestError, response } = yield call(
        api.get,
        "auth/getSelfMeta"
      );
      if (!requestError && response.userMeta) {
        yield put({
          type: "setLoggedIn",
          payload: {
            loggedIn: true,
            token: token,
            loggedInUser: {
              id: response.userMeta.id,
              username: response.userMeta.username,
              email: response.userMeta.email,
              bio: response.userMeta.bio
            }
          }
        });
      }
    },
    *logout({ payload }, { call, put }) {
      const { requestError, response } = yield call(api.post, "auth/logout");

      yield put({
        type: "setLoggedIn",
        payload: {
          loggedIn: false,
          token: null,
          loggedInUser: {
            id: null,
            username: null,
            email: null,
            bio: null
          }
        }
      });
    }
  }
};
