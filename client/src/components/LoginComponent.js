import {
    Button, Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl, FormHelperText,
    IconButton,
    InputLabel,
    OutlinedInput
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {useContext, useState} from "react";
import {useAuthDispatch, useAuthState} from "./auth/context";
import {StoreContext} from "../store/store";
import {useNavigate} from "react-router-dom";
import {ACCESS_TOKEN_KEY, ALERT_LEVEL, BASE_URL, CURRENT_USER_KEY} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {authTypes} from "./auth/reducer";

export default function LoginComponent() {
    const state = useAuthState()
    const isOpenLoginForm = state.isOpenLoginForm
    const dispatch = useAuthDispatch()

    const store = useContext(StoreContext)
    const {setMessage, setAlertLevel} = store
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState('')
    const [pending, setPending] = useState(false)
    const [userName, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(null);

    const handleInputName = (event) => {
        setUsername(event.target.value)
    }
    const handleInputPassword = (event) => {
        setPassword(event.target.value)
    }
    const handleCloseLoginForm = () => {
        dispatch({type: authTypes.CLOSE_LOGIN_FORM})
        setInitState()
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const setInitState = () => {
        setUsername('')
        setPassword('')
        setErrorMsg('')
        setPending(false)
    }

    const submitLoginForm = async (event) => {
        event.preventDefault()
        setPending(true)
        const url = BASE_URL + '/auth/login'
        const data = await fetcher({
            url,
            payload: {username: userName, password},
            method: "POST",
            credentials: true
        });
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

    return (
        <>
            <Dialog open={isOpenLoginForm} onClose={handleCloseLoginForm}>
                <form name="login_form" onSubmit={submitLoginForm}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>

                        <DialogContentText>
                            To view items you should be logged in. To create user please contact administrator.
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
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseLoginForm}>Cancel</Button>
                        <LoadingButton
                            loading={pending}
                            type="submit">Login</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}