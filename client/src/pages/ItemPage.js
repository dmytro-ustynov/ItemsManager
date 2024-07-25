import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {observer} from "mobx-react";
import React, {useEffect, useState} from "react";
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
import {Roles, useAuthState} from "../components/auth/context";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import MessageHandler from "../components/MessageHandler";

function ItemPage() {
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get('item_id');
    const [item, setItem] = useState(null)
    const [qrURL, setQrURL] = useState(QRCODE_URL)
    const [errorMessage, setErrorMessage] = useState(null)

    const state = useAuthState()
    const user = state.user
    const navigate = useNavigate();

    const getItem = async () => {
        const url = BASE_URL + `/items/${itemId}`
        const data = await fetcher({url, method: 'GET', credentials: true})
        if (!!data.item) {
            setItem(data.item)
        } else {
            setItem(null)
        }
    }

    useEffect(() => {
        if (!!itemId && user.role !== Roles.ANONYMOUS) {
            getItem()
        }
        if (user.role === Roles.ANONYMOUS) {
            setErrorMessage('Для перегляду необхідно увійти')
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
    }, [itemId, user.role]);

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
                <div className={"items-list"}>

                    <div className={"item-block"} key={item._id}>

                        <Collapsible className={"item-collapsible-block"}
                                     key={item._id}
                                     open={true}
                                     trigger={<ItemCaption item={item}/>}>
                            <ItemInfo item={item} mode={'info'}/>
                        </Collapsible>
                    </div>
                    <div className='item-actions'>
                        <div style={{flex: 1, margin: "5px 0 5px 5px"}}><Typography
                            variant="h6">Згенерувати</Typography>
                            <div>Акт технічного стану
                                <IconButton fontSize="small">
                                    <DownloadIcon color='primary'/>
                                </IconButton></div>
                            <div>Накладна на видачу<IconButton fontSize="small">
                                <DownloadIcon color='primary'/>
                            </IconButton></div>
                            <div>Акт списання<IconButton fontSize="small">
                                <DownloadIcon color='primary'/>
                            </IconButton></div>
                            <div>Бірка<IconButton fontSize="small">
                                <DownloadIcon color='primary'/>
                            </IconButton></div>
                            <Typography
                                variant="h6">Додатково</Typography>
                            <div><ConstructionIcon fontSize="small"/>Складові частини | комплектуючі</div>
                            <div><ImportContactsIcon fontSize="small"/>Формуляр</div>
                            <div><UpdateIcon fontSize="small"/>Напрацювання</div>
                        </div>
                        <div style={{flex: 1, margin: "5px 0 5px 5px"}}><img src={qrURL} alt="qr_code" width={"220px"}/>
                        </div>
                    </div>
                </div> : <div className="page-placeholder">
                    <div>{errorMessage}</div>
                    {user.role !== Roles.REGISTERED && <Link to="/login">Login</Link>}
                </div>
            }
            <MessageHandler/>
            <Footer/>
        </>
    );
}

export default observer(ItemPage);