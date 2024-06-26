import {useState} from "react";
// import {useAuthDispatch, useAuthState} from "./context";
import styles from '../auth.module.css';
import {loginUser} from "../actions";
import {useAuthDispatch, useAuthState} from "../context";


function LoginPage(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useAuthDispatch()
    const {loading, errorMessage} = useAuthState() //read the values of loading and errorMessage from context

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            let response = await loginUser(dispatch, {username, password})
            // console.log(response)
            if (!response.user) return
            props.history.push('/')
        } catch (error) {
            console.log(error)
        }
    }
    console.log('ok, login')
    return (
        <div className={styles.container}>
            <div className={{width: 200}}>
                <h1>Login Page</h1>
                {
                    errorMessage ? <p className={styles.error}>{errorMessage}</p> : null
                }
                <form>
                    <div className={styles.loginForm}>
                        <div className={styles.loginFormItem}>
                            <label htmlFor="email">Username</label>
                            <input type="text" id='username' value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                   disabled={loading}/>
                        </div>
                        <div className={styles.loginFormItem}>
                            <label htmlFor="password">Password</label>
                            <input type="password" id='password' value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   disabled={loading}/>
                        </div>
                    </div>
                    <button onClick={handleLogin} disabled={loading}>login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage