import React, {useContext, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import {DeleteForever} from "@mui/icons-material";
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';
import {ALERT_LEVEL, BASE_URL, FIELDS} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {StoreContext} from "../store/store";
import Loader from "./loader";
import {useNavigate} from "react-router-dom";


const forbiddenKeys = ['_id', 'created_at', 'updated_at', 'service_number'];

function RootItemActions({item, setItem}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [itemBody, setItemBody] = useState(null)
    const [jsonErrorMessage, setJsonErrorMessage] = useState(null)

    const store = useContext(StoreContext)
    const {deleteItem, pending, startRequest, finishRequest, setMessage, setAlertLevel, replaceItem} = store
    const navigate = useNavigate();

    useEffect(() => {
        const {_id, updated_at, created_at, service_number, inventory, ...i} = item
        setItemBody(JSON.stringify(i, undefined, 2))
    }, [item])

    const handleEditItem = () => {
        setEditDialogOpen(true)
    }

    const deleteHandler = async () => {
        startRequest()
        const url = BASE_URL + `/items/${item._id}`
        const response = await fetcher({url, method: "DELETE", credentials: true})
        if (response.result === true) {
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage("Успішно видалено !")
            if (window.location !== '/') {
                navigate('/')
            }
            deleteItem(item._id)
        } else {
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage("Помилка при видаленні елементу!")
        }
        finishRequest()
    }

    const editHandler = async (event) => {
        startRequest()
        const url = BASE_URL + `/items/${item._id}`
        const res = await fetcher({url, credentials: true, method: "PUT", payload: {update: itemBody}})
        if (res.result === true) {
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage("Успішно збережено!")
            replaceItem(item._id, res.updated)
            setItem && setItem({_id: item._id, ...res.updated})
            setEditDialogOpen(false)
        } else {
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage('Помилка збереження на сервері')
        }
        finishRequest()
    }

    const beautify = () => {
        !jsonErrorMessage && setItemBody(JSON.stringify(JSON.parse(itemBody), undefined, 2))
    }

    const undoChanges = () => {
        const {_id, updated_at, created_at, service_number, inventory, ...i} = item
        setItemBody(JSON.stringify(i, undefined, 2))
        setJsonErrorMessage(null)
    }

    const changeItemInput = (e) => {
        setItemBody(e.target.value)
        const errMessage = (input) => {
            try {
                const obj = JSON.parse(input);
                if (typeof obj !== 'object' || obj === null) {
                    return 'Некоректний формат JSON'
                }
                for (const key of forbiddenKeys) {
                    if (obj.hasOwnProperty(key)) {
                        return `Атрибут ${key} використовувати не можна`;
                    }
                }
                return null;
            } catch (e) {
                return 'Некоректний формат JSON'
            }
        }
        const err = errMessage(e.target.value)
        setJsonErrorMessage(err)
    }

    return (<div>
        <IconButton fontSize="small" onClick={handleEditItem}>
            <EditIcon color='primary'/>
        </IconButton>
        <IconButton fontSize="small" onClick={() => setDeleteDialogOpen(true)}>
            <DeleteForever color='error'/>
        </IconButton>
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle
                sx={{
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'center'
                }}>Видалення елементу</DialogTitle>
            <DialogContent>
                Ви впевнені, що бажаєте видалити цей елемент?
                <p><strong>{item[FIELDS.NAME]}</strong></p>
            </DialogContent>
            <DialogActions sx={{m: 2.5}}>
                {pending ? <Loader/> : <><Button onClick={() => {
                    setDeleteDialogOpen(false);
                }}> Cancel </Button>
                    <Button variant="contained"
                            color="error"
                            onClick={deleteHandler}
                            endIcon={<DeleteForever/>}
                    > Delete </Button></>}
            </DialogActions>
        </Dialog>
        <Dialog fullWidth={true}
                maxWidth="md"
                open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle
                sx={{
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'center'
                }}>Редагування елементу</DialogTitle>
            <DialogContent>
                <IconButton onClick={undoChanges}>
                    <UndoIcon color="primary"/>
                </IconButton>
                <Button variant="outlined"
                        disabled={!!jsonErrorMessage}
                        onClick={beautify}>Beautify</Button>
                <TextField
                    multiline={true}
                    error={!!jsonErrorMessage}
                    label="{ JSON }"
                    sx={{marginTop: "10px"}}
                    helperText={jsonErrorMessage}
                    fullWidth={true}
                    onChange={changeItemInput}
                    value={itemBody}
                />
            </DialogContent>
            <DialogActions sx={{m: 2.5}}>
                {pending ? <Loader/> : <>
                    <Button onClick={() => {
                        setEditDialogOpen(false);
                    }}> Cancel </Button>
                    <Button variant="contained"
                            disabled={!!jsonErrorMessage}
                            onClick={editHandler}
                            endIcon={<SaveIcon/>}
                    > Update </Button></>}
            </DialogActions>
        </Dialog>
    </div>)
}

export default observer(RootItemActions)