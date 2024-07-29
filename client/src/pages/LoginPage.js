import logoImage from "../images/logo_640.jpg";
import HeaderMenu from "../components/HeaderMenu";
import Footer from "../components/Footer";
import React, {useEffect} from "react";
import MessageHandler from "../components/MessageHandler";
import {authTypes} from "../components/auth/reducer";
import {useAuthDispatch} from "../components/auth/context";

function LoginPage() {
    const dispatch = useAuthDispatch()

    useEffect(() => {
        dispatch({type: authTypes.OPEN_LOGIN_FORM})
    }, [dispatch]);

    return (
        <>
            <header className="top-header">
                <div className="header-left-menu"/>
                <img src={logoImage} alt={"logo"} className={"image-logo"}
                     onClick={() => {
                         window.location.replace("/")
                     }}/>
                <h1>Mайно кафедри </h1>
                <HeaderMenu/>
            </header>
            <div className="page-placeholder"/>
            <MessageHandler/>
            <Footer/>
        </>
    );
}

export default LoginPage;