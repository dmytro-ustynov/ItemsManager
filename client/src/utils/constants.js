const PORT = process.env.REACT_APP_SERVER_PORT || 8000
const HOST = process.env.REACT_APP_SERVER_HOST || 'localhost'
export const BASE_URL = `http://${HOST}:${PORT}`
export const SEARCH_URL = "/items"
export const SAVE_NOTE_URL = "/items/save_note"
export const EXPORT_URL = "/items/export"
export const ADD_FIELD_URL = "/items/update"
export const CREATE_ITEM_URL = "/items/create"
export const ACCESS_TOKEN_KEY = "access_token"
export const CURRENT_USER_KEY = "current_user"

export const FIELDS = {
    NAME: "найменування",
    INVENTORY_NUMBER: "інвентарний номер",
    YEAR: "рік виготовлення",
    SERIAL: "заводський номер",
}

export const ALERT_LEVEL = {
    INFO: 'info',
    WARNING: 'warning'
}
