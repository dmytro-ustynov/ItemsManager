import React, {useCallback, useContext, useEffect, useState} from "react";
import Collapsible from "react-collapsible";
import ItemInfo from "./ItemInfo";
import ItemCaption from "./ItemCaption";
import {Checkbox, IconButton} from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {Roles, useAuthDispatch, useAuthState} from "./auth/context";
import {useNavigate} from "react-router-dom";
import {BASE_URL, SEARCH_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import PaginationComponent from "./Pagination";
import {authTypes} from "./auth/reducer";

function ItemList() {
    const store = useContext(StoreContext)
    const {items, pending, setItems, startRequest, finishRequest, setFields, counters} = store
    const [checkedCounter, setCheckedCounter] = useState(0)
    const state = useAuthState()
    const user = state.user
    const dispatch = useAuthDispatch()
    const navigate = useNavigate();

    const getItems = useCallback(async () => {
        let getUrl = BASE_URL + SEARCH_URL
        if (user.role === "registered" && user.is_active === true) {
            console.debug('fetching: ' + getUrl)
            startRequest()
            const data = await fetcher({url: getUrl, method: "GET", credentials: true})
            if (data && !!data.items) {
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
    }, [finishRequest, setFields, setItems, startRequest, user.is_active, user.role])

    useEffect(() => {
        if (user.role !== Roles.REGISTERED) {
            sessionStorage.removeItem('redirectTo')
        }
        getItems()
    }, [store, user.role, getItems])

    const openLoginForm = () => {
        dispatch({type: authTypes.OPEN_LOGIN_FORM})
    };
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

    return (<>
            <PaginationComponent/>
            <div className={"items-list"}>
                {pending && <div style={{width: '100%'}}><LinearProgress/></div>}
                <div className="item-block" style={{minHeight: '25px'}}>
                    {user.role !== Roles.ANONYMOUS && <>
                        {counters.filtered !== null && counters.filtered !== undefined &&  // zero found elements is ok to display
                            <span style={{marginRight: "15px", color: "white"}}>
                            {counters.filtered === 0 ? "Нічого не знайдено" : `Знайдено: ${counters.filtered}`}
                            </span>}
                        <span className="text-info"> {checkedCounter > 0 ? `Відмічено: ${checkedCounter}` : ""}</span>
                    </>}
                </div>
                {user.role === Roles.REGISTERED && items.length > 0 && items.map((item) => {
                    return (
                        <div className="item-block" key={item._id}>
                            <Collapsible className={"item-collapsible-block"}
                                         key={item._id}
                                         trigger={<ItemCaption item={item}/>}>
                                <ItemInfo item={item}/>
                            </Collapsible>
                            <div style={{display: 'flex', alignItems: 'baseline'}}>
                                <IconButton title="Докладніше..."
                                            onClick={() => {
                                                navigate(`/item/?item_id=${item._id}`)
                                            }}>
                                    <ReadMoreIcon style={{color: 'white'}}/>
                                </IconButton>
                                <Checkbox onClick={handleCheckBoxClick} id={`checkbox-${item._id}`}/>
                            </div>
                        </div>
                    )
                })
                }
                {user.role !== Roles.REGISTERED &&
                    <div className={"text-info"} style={{marginTop: '30px'}}>
                        Для перегляду списку потрібно <span className="as-anchor" onClick={openLoginForm}>увійти</span>
                    </div>}
                {(user.role === Roles.REGISTERED && user.is_active !== true) &&
                    <div className={"text-info"} style={{marginTop: '30px'}}>
                        Ваш акаунт не активований, зверніться до адміністратора</div>}
            </div>
        </>
    )
}

export default observer(ItemList)