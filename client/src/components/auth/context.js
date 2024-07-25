import React, {useEffect, useReducer, useState} from "react";
import {AuthReducer, initialState, init} from './reducer';
import Skeleton from "@mui/material/Skeleton";
import {Stack} from "@mui/material";

const AuthStateContext = React.createContext();
const AuthDispatchContext = React.createContext();

export function useAuthState() {
    const context = React.useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error("useAuthState must be used within a AuthProvider");
    }
    return context;
}

export function useAuthDispatch() {
    const context = React.useContext(AuthDispatchContext);
    if (context === undefined) {
        throw new Error("useAuthDispatch must be used within a AuthProvider");
    }
    return context;
}

export const AuthProvider = ({children}) => {
    const [state, dispatch] = useReducer(AuthReducer, initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const {user, token} = await init();
            dispatch({type: 'LOGIN_SUCCESS', payload: {user, token}});
            setIsInitialized(true);
        };
        initializeAuth();
    }, []);

    if (!isInitialized) {
        return (
            <div className="page-placeholder">
                <Stack spacing={1}>
                    <Skeleton variant="rectangular" width={"80%"} height={"10vh"}/>
                    Loading...
                    <Skeleton variant="rectangular" width={"80%"} height={60}/>
                    <Skeleton variant="rounded" width={"80%"} height={60}/>
                </Stack>
            </div>)
    }

    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchContext.Provider value={dispatch}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    );
};

export const Roles = {
    ANONYMOUS: 'anonymous',
    REGISTERED: 'registered',
    PREMIUM: 'premium',
}