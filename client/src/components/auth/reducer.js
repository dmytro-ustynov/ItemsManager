import { v4 as uuidv4 } from 'uuid';
import {fetcher} from "../../utils/fetch_utils";
import {ACCESS_TOKEN_KEY, BASE_URL, CURRENT_USER_KEY} from "../../utils/constants";

let user
let token
let uid


const getCookie = function(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
}

const init = async ()=>{
  const url = BASE_URL + '/auth/refresh_token'
  user = localStorage.getItem(CURRENT_USER_KEY)
  ? JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
  : "";
  if (!Boolean(user)) {
    uid = uuidv4();
    user = {
        user_id: uid,
        role: 'anonymous'
      }
  }
  const storageToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const cookieToken = getCookie(ACCESS_TOKEN_KEY)
  token = cookieToken || storageToken
  if (!token) {
    console.log('refreshing token')
    const payload = {uid: user.user_id}
    const tokenData = await fetcher({url, payload, credentials:true, method: "GET"})
    token = tokenData.access_token ? tokenData.access_token : ''
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

init()

export const initialState = {
  user: "" || user,
  accessToken: "" || token,
  loading: false,
  errorMessageLogin: null,
  errorMessageRegister: null,
};

export const authTypes = {
  REQUEST_LOGIN: 'REQUEST_LOGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REQUEST_REGISTER: 'REQUEST_REGISTER',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',

}

export const AuthReducer = (initialState, action) => {
  switch (action.type) {
    case authTypes.REQUEST_LOGIN:
      return {
        ...initialState,
        loading: true
      };
    case authTypes.LOGIN_SUCCESS:
      return {
        ...initialState,
        user: action.payload.user,
        accessToken: action.payload.access_token,
        loading: false,
        errorMessageLogin: null
      };
    case authTypes.LOGIN_ERROR:
      return {
        ...initialState,
        loading: false,
        errorMessageLogin: action.error,
      };
    case authTypes.LOGOUT:
      return {
        ...initialState,
        // user: null,
        user: {
        //   user_id: uid,
          role: 'anonymous'
        },
        accessToken: null,
        errorMessageLogin: null,
      };
    case authTypes.REQUEST_REGISTER:
      return {
        ...initialState,
        loading: true
      };
    case authTypes.REGISTER_SUCCESS:
      return {
        ...initialState,
        user: action.payload.user,
        accessToken: action.payload.access_token,
        loading: false,
        errorMessageRegister: null
      };
    case authTypes.REGISTER_ERROR:
      return {
        ...initialState,
        loading: false,
        errorMessageRegister: action.error
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};