import React, {useContext, useEffect, useState} from "react";
import {countServiceNumbers} from "../utils/counters";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {SERVICES} from "../generated_constants";
import Loader from "./loader";

function TotalInfo() {
    const store = useContext(StoreContext)
    const {items, pending} = store
    const [counters, setCounters] = useState({})

    useEffect(() => {
        let _counters = countServiceNumbers(items)
        setCounters(_counters)
    }, [items, items.length]);

    return (
        <div className={"search-handlers"}>
            {pending? <Loader />: <>
                <div className={"info-total"}>
                    Всього: {items.length}
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