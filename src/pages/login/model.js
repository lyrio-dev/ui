import api from "@/services/api";
import { formatMessage } from "umi/locale";
import { message } from 'antd';

const initialState = {
  pending: false,
  success: false,
  error: {
    type: null,
    message: null
  }
};

export default {
  namespace: "login",
  state: initialState,
  reducers: {
    resetState() {
      return initialState;
    },
    setPending(state, { payload: { pending } }) {
      return {
        ...state,
        pending
      };
    },
    setSuccess(state, { payload: { success } }) {
      return {
        ...state,
        success
      };
    },
    setError(state, { payload: { error } }) {
      return {
        ...state,
        error
      };
    }
  },
  effects: {
    *login({ payload }, { call, put, select }) {
      if (yield select(state => state.pending)) {
        return;
      }

      yield put({
        type: "setPending",
        payload: {
          pending: true
        }
      });

      let errorType = null, errorMessage = null;
      if (payload.username.length === 0) {
        errorType = "username";
        errorMessage = formatMessage({ id: "syzoj.login.empty_username" });
      } else if (payload.password.length === 0) {
        errorType = "password";
        errorMessage = formatMessage({ id: "syzoj.login.empty_password" });
      } else {
        const { requestError, response } = yield call(api.post, "auth/login", payload);
        if (requestError) message.error(requestError);
        else if (response.error) {
          switch (response.error) {
            case "ALREADY_LOGGEDIN":
              message.error(formatMessage({ id: "syzoj.login.already_loggedin" }))
              break;
            case "NO_SUCH_USER":
              errorType = "username";
              errorMessage = formatMessage({ id: "syzoj.login.no_such_user" });
              break;
            case "WRONG_PASSWORD":
              errorType = "password";
              errorMessage = formatMessage({ id: "syzoj.login.wrong_password" });
              break;
            default:
          }
        } else {
          message.success(formatMessage({ id: "syzoj.login.welcome" }, { username: payload.username }));
          yield put({
            type: "app/setLoggedIn",
            payload: {
              loggedIn: true,
              token: response.token,
              loggedInUser: {
                id: response.userMeta.id,
                username: response.userMeta.username,
                email: response.userMeta.email,
                bio: response.userMeta.bio
              }          
            }
          });

          yield put({
            type: "setSuccess",
            payload: {
              success: true
            }
          });
        }
      }

      yield put({
        type: "setError",
        payload: {
          error: {
            type: errorType,
            message: errorMessage
          }
        }
      });

      yield put({
        type: "setPending",
        payload: {
          pending: false
        }
      });
    }
  }
};
