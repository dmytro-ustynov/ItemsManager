import Header from "../components/Header";
import ItemList from "../components/ItemList";
import Footer from "../components/Footer";
import React, {useContext, useEffect} from "react";
import {observer} from "mobx-react";
import SearchFilterBlock from "../components/SearchFilterBlock";
import TotalInfo from "../components/TotalInfo";
import {StoreContext} from "../store/store";
import MessageHandler from "../components/MessageHandler";

function HomePage() {
    // const store = useContext(StoreContext)
    //
    // useEffect(() => {
    //     if (store.items.length === 0) {
    //         store.fetchItems();
    //     }
    // }, [store]);

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