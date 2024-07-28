import Header from "../components/Header";
import Footer from "../components/Footer";
import React from "react";

function Page404() {
    return (
        <>
            <Header/>
            Sorry, page you are looking not found
            <div style={{height: "85vh"}}>
                <a href="/">Home</a>
            </div>
            <Footer/>
        </>
    );
}

export default Page404;