import React, {useContext, useEffect, useState} from "react";
import {BASE_URL, SEARCH_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import Collapsible from "react-collapsible";
import ItemInfo from "./ItemInfo";
import ItemCaption from "./ItemCaption";
import {Checkbox, CircularProgress} from "@mui/material";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";


function ItemList() {
    const store = useContext(StoreContext)
    const {items, setItems, setFields, pending, startRequest, finishRequest} = store
    const [checkedCounter, setCheckedCounter] = useState(0)

    const getItems = async () => {
        let getUrl = BASE_URL + SEARCH_URL
        console.debug('fetching: ' + getUrl)
        startRequest()
        const data = await fetcher({url: getUrl, method: "GET"})
        const foundItems = await data.items || []
        const fields = await data.fields || []
        setItems(foundItems)
        setFields(fields)
        finishRequest()
    }
    useEffect(() => {
        getItems()
    }, [])
    const handleCheckBoxClick = (event) => {
        let counter = checkedCounter
        if (event.target.checked === true) {
            counter++
        }
        if (event.target.checked === false) {
            counter--
        }
        setCheckedCounter(counter)
    }

    return (
        <div className={"items-list"}>
            {pending && <CircularProgress/>}
            <div>
                {checkedCounter > 0 && <span className={"text-info left"}> Відмічено: {checkedCounter}</span>}
            </div>

            {items.length > 0 && items.map((item) => {
                return (
                    <div className={"item-block"} key={item._id}>
                        <Collapsible className={"item-collapsible-block"}
                                     key={item._id}
                                     trigger={<ItemCaption item={item}/>}>
                            <ItemInfo item={item}/>
                        </Collapsible>
                        <Checkbox onClick={handleCheckBoxClick}/>
                    </div>
                )
            })
            }
        </div>
    )
}

export default observer(ItemList)