import React, {useContext} from "react";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {SERVICES} from "../generated_constants";
import Loader from "./loader";

function TotalInfo() {
    const store = useContext(StoreContext)
    const {counters, pending} = store

    return (
        <div className={"search-handlers"}>
            {pending? <Loader />: <>
                <div className={"info-total"}>
                    Всього: {counters.total}
                </div>
                {Object.keys(SERVICES).map((key) => {
                    return <div key={key}
                                className={`info-${SERVICES[key].alias}`}>&#10687; {SERVICES[key].name}:
                        - {counters[key]}</div>
                })}</>}
        </div>
    )
}

export default observer(TotalInfo)