import React, {useContext} from "react";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {SERVICES} from "../generated_constants";
import Loader from "./loader";

function TotalInfo() {
    const store = useContext(StoreContext)
    const {counters, pending} = store
    const {filterItems, dropFilters} = store

    const filterByServiceName = (key) => {
        filterItems({service: SERVICES[key].alias.toUpperCase()})
    }

    return (
        <div className={"search-handlers"}>
            {pending ? <Loader/> : <>
                <div className="info-total as-anchor" onClick={() => dropFilters()}>
                    Всього: {counters.total}
                </div>
                {Object.keys(SERVICES).map((key) => {
                    return <div key={key}
                                onClick={() => filterByServiceName(key)}
                                className={`info-${SERVICES[key].alias}`}>&#10687;&#160;
                        <span className="as-anchor">{SERVICES[key].name}:
                        - {counters[key]} </span></div>
                })}</>}
        </div>
    )
}

export default observer(TotalInfo)