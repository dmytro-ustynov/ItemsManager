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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useState} from "react";
import {useAuthDispatch, useAuthState} from "./auth/context";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ACCESS_TOKEN_KEY, BASE_URL, CURRENT_USER_KEY} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils"
import {authTypes} from "./auth/reducer";
import FileUploadForm from "./FileUploadForm";

export default function Login() {
    const state = useAuthState()
    const user = state.user
    const [anchorEl, setAnchorEl] = useState(null);
    const [openLoginForm, setOpenLoginForm] = useState(false);
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
    const userTitle = user.role === 'anonymous' ? "Anonymous user, click Login" : user.username
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
        const data = await fetcher({url, payload: {username: userName, password}, method: "POST"});
        if (data.result === true) {
            setErrorMsg("")
            setSuccessMsg(`Successfully logged, welcome ${userName}!`)
            dispatch({type: authTypes.LOGIN_SUCCESS, payload: data});
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
            setTimeout(() => {
                handleCloseLoginForm()
            }, 1000)
            console.log(`user logged in`)
        } else {
            setErrorMsg(data.details)
            dispatch({type: authTypes.LOGIN_ERROR, error: data.errors});
        }
        setPending(false)
    }

    const handleLogout = async () => {
        handleClose()
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        dispatch({type: authTypes.LOGOUT});
        const url = BASE_URL + '/auth/logout'
        await fetcher({url})
    }

    const closePopUp = () => {
        setOpenDocsDialog(false)
        setAnchorEl(null);
    }

    return (<>
            <Menu id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                      'aria-labelledby': 'basic-button',
                  }}>
                {user.role === 'anonymous' &&
                    <MenuItem onClick={handleClickLoginMenu}>
                        <ListItemIcon><LoginIcon/> </ListItemIcon>
                        <ListItemText>Login</ListItemText>
                    </MenuItem>}
                <MenuItem onClick={handleClose} disabled={user.role === 'anonymous'}>
                    <ListItemIcon><ManageAccountsIcon/> </ListItemIcon>
                    <ListItemText>My account</ListItemText>
                </MenuItem>
                {user.role !== 'anonymous' && <MenuItem onClick={() => {
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
                <MenuItem onClick={handleClose}>
                    <ListItemIcon><HelpCenterIcon/> </ListItemIcon>
                    <ListItemText>Допомога</ListItemText>
                </MenuItem>
                {user.role !== 'anonymous' && <Divider/>}
                {user.role !== 'anonymous' &&
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