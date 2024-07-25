import React, {useContext, useEffect, useState} from "react";
import {BASE_URL, SEARCH_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import Collapsible from "react-collapsible";
import ItemInfo from "./ItemInfo";
import ItemCaption from "./ItemCaption";
import {Checkbox, CircularProgress, IconButton} from "@mui/material";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {useAuthState} from "./auth/context";
import {useNavigate} from "react-router-dom";

function ItemList() {
    const store = useContext(StoreContext)
    const {items, setItems, setFields, pending, startRequest, finishRequest} = store
    const [checkedCounter, setCheckedCounter] = useState(0)
    const state = useAuthState()
    const user = state.user
    const navigate = useNavigate();

    const getItems = async () => {
        let getUrl = BASE_URL + SEARCH_URL
        if (user.role === "registered" && user.is_active === true) {
            console.debug('fetching: ' + getUrl)
            startRequest()
            const data = await fetcher({url: getUrl, method: "GET", credentials: true})
            if (!!data.items) {
                const foundItems = await data.items || []
                const fields = await data.fields || []
                setItems(foundItems)
                setFields(fields)
            } else {
                setFields([])
                setItems([])
            }
            finishRequest()
        } else {
            setItems([])
        }

    }
    useEffect(() => {
        getItems()
    }, [user.role])
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

            {user.role === 'registered' && items.length > 0 && items.map((item) => {
                return (
                    <div className={"item-block"} key={item._id}>
                        <Collapsible className={"item-collapsible-block"}
                                     key={item._id}
                                     trigger={<ItemCaption item={item}/>}>

                            <ItemInfo item={item}/>
                        </Collapsible>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <IconButton title="Докладніше..."
                                        onClick={() => {
                                            navigate( `/item/?item_id=${item._id}`)
                                        }}>
                                <ReadMoreIcon style={{color: 'white'}}/>
                            </IconButton>
                            <Checkbox onClick={handleCheckBoxClick}/>
                        </div>

                    </div>
                )
            })
            }
            {user.role !== 'registered' &&
                <div className={"text-info"} style={{marginTop: '30px'}}>
                    Для перегляду списку потрібно увійти</div>}
            {(user.role === 'registered' && user.is_active !== true) &&
                <div className={"text-info"} style={{marginTop: '30px'}}>
                    Ваш акаунт не активований, зверніться до адміністратора</div>}
        </div>
    )
}

export default observer(ItemList)