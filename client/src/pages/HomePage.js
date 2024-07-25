import Header from "../components/Header";
import ItemList from "../components/ItemList";
import Footer from "../components/Footer";
import React from "react";
import {observer} from "mobx-react";
import SearchFilterBlock from "../components/SearchFilterBlock";
import TotalInfo from "../components/TotalInfo";
import MessageHandler from "../components/MessageHandler";

function HomePage() {
    return (
        <>
            <Header/>
            <SearchFilterBlock/>
            <TotalInfo/>
            <ItemList/>
            <MessageHandler/>
            <Footer/>
        </>
    );
}

export default observer(HomePage);