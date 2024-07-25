import logoImage from "../images/logo_640.jpg";
import Login from "../components/Login";
import Footer from "../components/Footer";
import React from "react";
import MessageHandler from "../components/MessageHandler";

function LoginPage({file}) {
    return (
        <>
            <header className="top-header">
                <div className="header-left-menu"/>
                <img src={logoImage} alt={"logo"} className={"image-logo"}
                     onClick={() => {
                         window.location.replace("/")
                     }}/>
                <h1>Mайно кафедри </h1>
                <Login isOpen={true}/>
            </header>
            <div className="page-placeholder"/>
            <MessageHandler/>
            <Footer/>
        </>
    );
}

export default LoginPage;