import React, {useContext} from "react";
import {serviceCounter} from "../utils/counters";
import {StoreContext} from "../store/store";
import refreshGif from "../images/icons8-refresh.gif"
import {observer} from "mobx-react";
import {SERVICES} from "../generated_constants";

function Loader() {
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

    const serviceInfo = (service) => {

    }

    return (
        <div className={"search-handlers"}>
            <div className={"info-total"}>
                Всього: {pending ? <Loader/> : items.length}
            </div>
            {/*<div className={"info-vnlz"}>&#10687; - ВНЛЗ: {pending? <Loader /> :counterVNLZ()} </div>*/}
            {/*<div className={"info-sz"}>&#10687; - Служба зв'язку: {pending?<Loader /> : counterSZ()}</div>*/}
            {Object.keys(SERVICES).map((key) => {
                return <div key={key}
                            className={`info-${SERVICES[key].icon}`}>&#10687; - {SERVICES[key].name}: {pending ?
                    <Loader/> : serviceCounter(items, key)}</div>
            })}
        </div>
    )
}

export default observer(TotalInfo)