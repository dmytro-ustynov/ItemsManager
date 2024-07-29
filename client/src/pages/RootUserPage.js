import logoImage from "../images/logo_640.jpg";
import Footer from "../components/Footer";
import React, {useCallback, useContext, useEffect, useState} from "react";
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import MessageHandler from "../components/MessageHandler";
import {observer} from "mobx-react";
import {fetcher} from "../utils/fetch_utils";
import {ALERT_LEVEL, BASE_URL, REFRESH_TOKEN_URl} from "../utils/constants";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, FormHelperText,
    IconButton,
    InputLabel,
    OutlinedInput
} from "@mui/material";
import {StoreContext} from "../store/store";
import InputAdornment from "@mui/material/InputAdornment";
import {Visibility, VisibilityOff} from "@mui/icons-material";

function RootUserPage() {
    const [allowed, setAllowed] = useState(false)
    const [users, setUsers] = useState([])
    const [confirmDialog, setConfirmDialog] = useState(false)
    const [passwordDialog, setPasswordDialog] = useState(false)
    const [confirmMessage, setConfirmMessage] = useState("")
    const [submitParams, setSubmitParams] = useState({})
    const [showPassword, setShowPassword] = useState(null);
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState(null)
    const [filesCount, setFilesCount] = useState(0)
    const store = useContext(StoreContext)
    const {setMessage, setAlertLevel} = store

    const checkIsRoot = useCallback(async () => {
        const url = BASE_URL + REFRESH_TOKEN_URl;
        const data = await fetcher({url, method: "GET", credentials: true});
        const userData = data.user;
        if (!!userData && userData.username === 'root') {
            setAllowed(true);
        } else {
            setAllowed(false);
        }
    }, []);

    const getUsers = useCallback(async () => {
        const url = BASE_URL + '/user/all';
        const data = await fetcher({url, method: "GET", credentials: true});
        if (!!data.users) {
            setUsers(data.users);
        }
    }, []);

    const getFilesCount = useCallback(async () => {
        const url = BASE_URL + '/files/count';
        const data = await fetcher({url, method: "GET", credentials: true});
        if (data.result === true) {
            setFilesCount(data.count);
        }
    }, []);

    const clearSystemFolder = async () => {
        const url = BASE_URL + '/files/clear_yesterday_files'
        const data = await fetcher({url, method: "PUT", credentials: true})
        if (data.result === true) {
            setMessage(data.details)
        }
    }
    useEffect(() => {
        checkIsRoot();
        getUsers();
        getFilesCount();
    }, [checkIsRoot, getUsers, getFilesCount]);

    const openActivateConfirmation = (username, user_id) => {
        setConfirmMessage(`Ви впевнені що хочете активувати  користувача "${username}"?`)
        const url = BASE_URL + `/user/activate_user?user_id=${user_id}`
        setSubmitParams({url, credentials: true})
        setConfirmDialog(true)
    }
    const openDeactivateConfirmation = (username, user_id) => {
        setConfirmMessage(`Користувач "${username}" активований в системі. Ви впевнені що хочете призупинити йому доступ?`)
        const url = BASE_URL + `/user/deactivate_user?user_id=${user_id}`
        setSubmitParams({url, credentials: true})
        setConfirmDialog(true)
    }
    const openDeleteConfirmation = (username, user_id) => {
        setConfirmMessage(`Ви впевнені що хочете видалити користувача "${username}"?`)
        const url = BASE_URL + `/user/${user_id}`
        setSubmitParams({url, credentials: true, method: "DELETE"})
        setConfirmDialog(true)
    }

    const openPasswordForm = (username, user_id) => {
        setConfirmMessage(`Користувач "${username}"`)
        const url = BASE_URL + `/user/set_password?user_id=${user_id}`
        setSubmitParams({url, credentials: true})
        setPasswordDialog(true)
    }
    const submitConfirmation = async () => {
        console.log(submitParams)
        const data = await fetcher(submitParams)
        console.log(data)
        if (data.result === true) {
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage('Підтверджено. Оновіть сторінку')
        } else {
            console.log(data)
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage('Помилка! Перевірте логи')
        }
        setConfirmDialog(false)
    }
    const closeConfirmDialog = () => {
        setSubmitParams({})
        setConfirmDialog(false)
        setPasswordDialog(false)
        setPassword("")
    }
    const handleInputPassword = (event) => {
        setPassword(event.target.value)
        if (event.target.value.length < 5) {
            setErrorMsg('Довжина паролю мінімум 5 символів')
        } else {
            setErrorMsg(null)
        }
    }
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const submitPasswordForm = async () => {
        const params = {
            ...submitParams,
            payload: {new_password: password, confirm_password: password}
        }
        console.log(params)
        const data = await fetcher(params)
        console.log(data)
        if (data.result === true) {
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage('Пароль змінено')
        } else {
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage('Помилка! Перевірте логи')
        }
        setPasswordDialog(false)
    }

    return (allowed ? <>
                <header className="top-header">
                    <div className="header-left-menu"/>
                    <img src={logoImage} alt={"logo"} className={"image-logo"}
                         onClick={() => {
                             window.location.replace("/")
                         }}/>
                    <h1> Налаштування </h1>
                    <div className="header-right-menu"/>
                </header>
                <div className="page-placeholder">
                    <a href={BASE_URL + '/docs'}>users</a>
                    <table>
                        <tbody>
                        <tr>
                            <th></th>
                            <th>Username</th>
                            <th>Дата створення</th>
                            <th>Дата змінення</th>
                        </tr>
                        {users.length > 0 && users.map((user) => {
                                return (
                                    <tr className="root-table-row" key={user.user_id}>
                                        <td className="root-table">{!user.is_active && <ReportProblemOutlinedIcon
                                            title="не активовано"/>} </td>
                                        <td className="root-table">{user.username}</td>
                                        <td className="root-table">{user.createdAt}</td>
                                        <td className="root-table">{user.updatedAt}</td>
                                        <td className="root-table">{user.is_active ?
                                            <button disabled={user.username === 'root'}
                                                    onClick={() => {
                                                        openDeactivateConfirmation(user.username, user.user_id)
                                                    }}>deactivate</button> :
                                            <button onClick={() => {
                                                openActivateConfirmation(user.username, user.user_id)
                                            }}>activate</button>}</td>
                                        <td className="root-table">
                                            <button disabled={user.username === 'root'} onClick={() => {
                                                openDeleteConfirmation(user.username, user.user_id)
                                            }}>DELETE
                                            </button>
                                        </td>
                                        <td className="root-table">
                                            <button onClick={() => {
                                                openPasswordForm(user.username, user.user_id)
                                            }}>password
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }
                        )
                        }</tbody>
                    </table>

                    <div><a href={BASE_URL + '/docs#/FILES'}>files</a></div>
                    <div>В папці експорту знайдено {filesCount} xls файлів.</div>
                    <button title="Видалити файли крім створених сьогодні" onClick={clearSystemFolder}> Очистити папку
                    </button>
                </div>
                <Dialog open={confirmDialog} onClose={closeConfirmDialog}>
                    <DialogTitle>
                        Root user action confirmation
                    </DialogTitle>
                    <DialogContent>
                        {confirmMessage}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeConfirmDialog}> Cancel </Button>
                        <Button variant="contained"
                                color="primary"
                                onClick={submitConfirmation}
                        > Підтвердити </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
                    <DialogTitle>
                        Встановіть пароль користувача
                    </DialogTitle>
                    <form name="setPassowrdForm">
                        <DialogContent>
                            {confirmMessage}
                            <FormControl sx={{m: 1, width: '25ch'}} variant="outlined" error={!!errorMsg}>
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    label="Password"
                                    autoComplete="on"
                                    onInput={handleInputPassword}
                                    endAdornment={<InputAdornment position="end">
                                        <IconButton aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end">
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>}
                                />
                                <FormHelperText>{errorMsg}</FormHelperText>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeConfirmDialog}> Cancel </Button>
                            <Button onClick={submitPasswordForm}
                                    color="primary">Встановити пароль</Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <MessageHandler/>
                <Footer/>
            </> :
            <>Forbidden</>
    )
}

export default observer(RootUserPage);