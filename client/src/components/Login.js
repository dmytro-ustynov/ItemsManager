import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider, FormControl, FormHelperText,
    IconButton, InputLabel, ListItemIcon, ListItemText, OutlinedInput,
} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import LoadingButton from '@mui/lab/LoadingButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InputAdornment from '@mui/material/InputAdornment';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useContext, useState} from "react";
import {Roles, useAuthDispatch, useAuthState} from "./auth/context";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ACCESS_TOKEN_KEY, ALERT_LEVEL, BASE_URL, CURRENT_USER_KEY} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils"
import {authTypes} from "./auth/reducer";
import FileUploadForm from "./FileUploadForm";
import {StoreContext} from "../store/store";
import {useNavigate} from "react-router-dom";

export default function Login({isOpen = false}) {
    const state = useAuthState()
    const user = state.user
    const store = useContext(StoreContext)
    const {setMessage, setAlertLevel} = store
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const [openLoginForm, setOpenLoginForm] = useState(isOpen);
    const [openDocsDialog, setOpenDocsDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)
    const [pending, setPending] = useState(false)

    const [userName, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useAuthDispatch()
    // menu logic
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const setInitState = () => {
        setUsername('')
        setPassword('')
        setErrorMsg(null)
        setSuccessMsg(null)
        setPending(false)
    }

    const handleClickLoginMenu = () => {
        setAnchorEl(null);
        setOpenLoginForm(true)
    }
    const userTitle = user.role === Roles.ANONYMOUS ? "Anonymous user, click Login" : user.username
    // form logic
    const handleCloseLoginForm = () => {
        setOpenLoginForm(false);
        setInitState()
    };
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleInputName = (event) => {
        setUsername(event.target.value)
    }
    const handleInputPassword = (event) => {
        setPassword(event.target.value)
    }
    const submitLoginForm = async (event) => {
        event.preventDefault()
        setPending(true)
        const url = BASE_URL + '/auth/login'
        const data = await fetcher({url,
            payload: {username: userName, password},
            method: "POST",
            credentials: true});
        if (data.result === true) {
            setErrorMsg("")
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage(`Successfully logged, welcome ${userName}!`)
            dispatch({type: authTypes.LOGIN_SUCCESS, payload: data});
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
            handleCloseLoginForm()
            console.log(`user logged in`)
            const redirectTo = sessionStorage.getItem('redirectTo') || '/';
            navigate(redirectTo);
        } else {
            let errMsg
            if (data.status === 500) {
                errMsg = 'Server error, please try later'
            } else {
                errMsg = data.details
            }
            setErrorMsg(errMsg)
            dispatch({type: authTypes.LOGIN_ERROR, error: errMsg});
        }
        setPending(false)
    }

    const handleLogout = async () => {
        store.setItems([])
        handleClose()
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        dispatch({type: authTypes.LOGOUT});
        const url = BASE_URL + '/auth/logout'
        await fetcher({url, credentials: true})
    }

    const closePopUp = () => {
        setOpenDocsDialog(false)
        setAnchorEl(null);
    }

    const accountClick = () =>{
        if (user.username === 'root'){
            navigate('/settings')
        }
        handleClose()
    }

    return (<>
            <Menu id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                      'aria-labelledby': 'basic-button',
                  }}>
                {user.role === Roles.ANONYMOUS &&
                    <MenuItem onClick={handleClickLoginMenu}>
                        <ListItemIcon><LoginIcon/> </ListItemIcon>
                        <ListItemText>Login</ListItemText>
                    </MenuItem>}
                <MenuItem onClick={accountClick} disabled={user.role === Roles.ANONYMOUS}>
                    {user.role === Roles.ANONYMOUS ? (<><ListItemIcon><ManageAccountsIcon/> </ListItemIcon>
                            <ListItemText>My account</ListItemText></>) :
                        <><ListItemIcon>{user.is_active === true ? <ManageAccountsIcon/> :
                            <ReportProblemOutlinedIcon title={"Необхідно активувати акаунт"}/>}
                        </ListItemIcon>
                            <ListItemText>{user.username}</ListItemText></>
                    }
                </MenuItem>
                {user.role !== Roles.ANONYMOUS &&
                    <MenuItem disabled={user.is_active !== true}
                              onClick={() => {
                                  setOpenUploadDialog(true);
                                  setAnchorEl(null)
                              }}>
                        <ListItemIcon><UploadFileIcon/> </ListItemIcon>
                        <ListItemText>Масова загрузка з Excel</ListItemText>
                    </MenuItem>}
                <MenuItem onClick={() => setOpenDocsDialog(true)}>
                    <ListItemIcon><LibraryBooksIcon/> </ListItemIcon>
                    <ListItemText>Документи</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => window.location = "/help"}>
                    <ListItemIcon><HelpCenterIcon/> </ListItemIcon>
                    <ListItemText>Допомога</ListItemText>
                </MenuItem>
                {user.role !== Roles.ANONYMOUS && <Divider/>}
                {user.role !== Roles.ANONYMOUS &&
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon/> </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                    </MenuItem>}
            </Menu>
            <Dialog open={openLoginForm} onClose={handleClose}>
                <form name="login_form" onSubmit={submitLoginForm}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>

                        <DialogContentText>
                            To edit items you should be looged in. To create user please contact Lt. Ustynov
                        </DialogContentText>

                        <FormControl sx={{m: 1, width: '25ch'}} variant="outlined">
                            <InputLabel htmlFor="input-name">User name</InputLabel>
                            <OutlinedInput
                                autoFocus
                                margin="dense"
                                id="input-name"
                                error={!!errorMsg}
                                value={userName}
                                onInput={handleInputName}
                                label='User name'
                            />
                        </FormControl>
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
                        {successMsg && <DialogContentText sx={{color: "green"}}>
                            {successMsg}
                        </DialogContentText>}

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseLoginForm}>Cancel</Button>
                        <LoadingButton
                            loading={pending}
                            type="submit">Login</LoadingButton>

                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDocsDialog} onClose={closePopUp}>
                <DialogTitle>Документи</DialogTitle>
                <DialogContent>
                    <ul>
                        <li>
                            <a href="/postanova" target="_blank" rel="noreferrer noopener"
                               title="Постанова про затвердження положення про інвентаризацію військового майна">Постанова
                                Кабінету міністрів Про затвердження Положення про інвентаризацію
                                військового майна у Збройних Силах</a>
                        </li>
                        <li>
                            <a href="/nakaz" target="_blank" rel="noreferrer noopener"
                               title="Наказ про затвердження інструкції з обліку військового майна">Наказ №440 Про
                                затвердження Інструкції з обліку військового майна у Збройних Силах України</a>
                        </li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePopUp}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openUploadDialog}
                    onClose={() => setAnchorEl(null)}>
                <FileUploadForm open={openUploadDialog}
                                setOpen={setOpenUploadDialog}/>
            </Dialog>

            <div className="header-right-menu">
                <IconButton
                    color={user.role === "registered" ? "primary" : "default"}
                    onClick={handleClick} title={userTitle}>
                    <AccountCircleIcon/>
                </IconButton>
            </div>
        </>
    )
}