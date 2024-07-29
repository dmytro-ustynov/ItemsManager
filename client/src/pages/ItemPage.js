import {useNavigate, useSearchParams} from 'react-router-dom';
import {observer} from "mobx-react";
import React, {useCallback, useContext, useEffect, useState} from "react";
import Collapsible from "react-collapsible";
import ItemCaption from "../components/ItemCaption";
import ItemInfo from "../components/ItemInfo";
import {fetcher} from "../utils/fetch_utils";
import {BASE_URL, QRCODE_URL} from "../utils/constants";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {Typography} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from '@mui/icons-material/Download';
import ConstructionIcon from '@mui/icons-material/Construction';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import UpdateIcon from '@mui/icons-material/Update';
import {Roles, useAuthDispatch, useAuthState} from "../components/auth/context";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import MessageHandler from "../components/MessageHandler";
import {StoreContext} from "../store/store";
import {authTypes} from "../components/auth/reducer";

function ItemPage() {
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get('item_id');
    const [item, setItem] = useState(null)
    const [qrURL, setQrURL] = useState(QRCODE_URL)
    const [errorMessage, setErrorMessage] = useState(null)

    const state = useAuthState()
    const user = state.user
    const dispatch = useAuthDispatch()
    const store = useContext(StoreContext)
    const {fields, setFields} = store
    const navigate = useNavigate();

    const getItem = useCallback(async () => {
        const url = BASE_URL + `/items/${itemId}`
        const data = await fetcher({url, method: 'GET', credentials: true})
        if (!!data.item) {
            setItem(data.item)
            fields.length === 0 && setFields(data.fields)
        } else {
            setItem(null)
        }
    }, [fields.length, itemId, setFields])

    useEffect(() => {
        if (!!itemId && user.role !== Roles.ANONYMOUS) {
            getItem()
        }
        if (user.role === Roles.ANONYMOUS) {
            setErrorMessage('Для перегляду необхідно ')
            const redirectUrl = window.location.pathname + window.location.search
            sessionStorage.setItem('redirectTo', redirectUrl)
        } else {
            sessionStorage.removeItem('redirectTo')
            if (!!itemId && !item) {
                setErrorMessage('Такий елемент не знайдено')
            } else {
                setErrorMessage(null)
            }
        }
        setQrURL(`${QRCODE_URL}/${itemId}`)
    }, [item, itemId, user.role, getItem]);

    const openLoginForm = () => {
        dispatch({type: authTypes.OPEN_LOGIN_FORM})
    };

    return (
        <>
            <Header/>
            <div className="back-pointer" onClick={() => navigate("/")}>
                <IconButton title="Назад до списку..."
                            sx={{transform: "scaleX(-1)"}}>
                    <ReadMoreIcon sx={{color: 'white'}}/>
                </IconButton> До списку
            </div>
            {!!item ?
                <div className="items-list">
                    <div className="item-block" key={item._id}>
                        <Collapsible className="item-collapsible-block"
                                     key={item._id}
                                     open={true}
                                     trigger={<ItemCaption item={item}/>}>
                            <ItemInfo item={item} setItem={setItem} mode={'info'}/>
                        </Collapsible>
                    </div>
                    <div className="item-actions">
                        <div className="item-table"><Typography
                            variant="h6">Згенерувати</Typography>
                            <div>Акт технічного стану
                                <IconButton fontSize="small">
                                    <DownloadIcon color='primary'/>
                                </IconButton></div>
                            <div>Накладна на видачу<IconButton fontSize="small">
                                <DownloadIcon color="primary"/>
                            </IconButton></div>
                            <div>Акт списання<IconButton fontSize="small">
                                <DownloadIcon color="primary"/>
                            </IconButton></div>
                            <div>Бірка<IconButton fontSize="small">
                                <DownloadIcon color="primary"/>
                            </IconButton></div>
                            <Typography
                                variant="h6">Додатково</Typography>
                            <div><ConstructionIcon fontSize="small"/>Складові частини | комплектуючі</div>
                            <div><ImportContactsIcon fontSize="small"/>Формуляр</div>
                            <div><UpdateIcon fontSize="small"/>Напрацювання</div>
                        </div>
                        <div className='item-table'><img src={qrURL} alt="qr_code" width={"220px"}/>
                        </div>
                    </div>
                </div> : <div className="page-placeholder">
                    <div className="text-info">{errorMessage}
                        {user.role !== Roles.REGISTERED &&
                            <span className="as-anchor" onClick={openLoginForm}>увійти</span>}
                    </div>
                </div>
            }
            <MessageHandler/>
            <Footer/>
        </>
    );
}

export default observer(ItemPage);