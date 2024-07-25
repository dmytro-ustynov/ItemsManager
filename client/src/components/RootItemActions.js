import React, {useContext, useState} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import {DeleteForever} from "@mui/icons-material";
import {ALERT_LEVEL, BASE_URL, FIELDS} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {StoreContext} from "../store/store";
import Loader from "./loader";


function RootItemActions(props) {
    let item = props.item
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const store = useContext(StoreContext)
    const {deleteItem,  pending, startRequest, finishRequest, setMessage, setAlertLevel} = store

    const handleEditItem = () => {
        console.log('will popup edit Form for the current item')
        console.log(item._id)
    }

    const deleteHandler = async () => {
        startRequest()
        const url = BASE_URL + `/items/${item._id}`

        console.log('delete request to back....', url)
        const response = await fetcher({url, method: "DELETE", credentials: true})
        console.log(response)
        if (response.result === true) {
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage("Успішно видалено !")
            deleteItem(item._id)
        } else {
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage("Помилка при видаленні елементу!")
        }
        finishRequest()
    }
    return (<div>
        <IconButton fontSize="small" onClick={handleEditItem}>
            <EditIcon color='primary'/>
        </IconButton>
        <IconButton fontSize="small" onClick={()=>setDeleteDialogOpen(true)}>
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
                {pending ? <Loader/>: <><Button onClick={() => {
                    setDeleteDialogOpen(false);
                }}> Cancel </Button>
                <Button variant="contained"
                        color="error"
                        onClick={deleteHandler}
                        endIcon={<DeleteForever/>}
                > Delete </Button></>}
            </DialogActions>
        </Dialog>
    </div>)
}

export default observer(RootItemActions)