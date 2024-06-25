import React, {useContext} from "react";
import {serviceCounter} from "../utils/counters";
import {StoreContext} from "../store/store";
import refreshGif from "../images/icons8-refresh.gif"
import {observer} from "mobx-react";

function Loader(){
    return <img src={refreshGif} alt=".." style={{height: '20px'}}/>
}
function TotalInfo() {
    // const items = store.items

    const store = useContext(StoreContext)
    const {items, pending} = store

    const counterVNLZ = () => {
        return serviceCounter(items, 1)
    }
    const counterSZ = () => {
        return serviceCounter(items, 2)
    }

    return(
        <div className={"search-handlers"}>
            <div className={"info-total"} >
            Всього: {pending? <Loader /> : items.length}
            </div>
            <div className={"info-vnlz"}>&#10687; - ВНЛЗ: {pending? <Loader /> :counterVNLZ()} </div>
            <div className={"info-sz"}>&#10687; - Служба зв'язку: {pending?<Loader /> : counterSZ()}</div>
        </div>
    )
}

export default observer(TotalInfo)