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
        const response = yield call(api.post, "login", payload);
        if (response.success) {
          message.success(formatMessage({ id: "syzoj.login.welcome" }, { username: payload.username }));
          yield put({
            type: "app/setLoggedIn",
            payload: {
              loggedIn: true,
              loggedInUser: {
                username: payload.username,
                avatar: null
              }          
            }
          });

          yield put({
            type: "setSuccess",
            payload: {
              success: true
            }
          });
        } else {
          message.error(response.message);
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
