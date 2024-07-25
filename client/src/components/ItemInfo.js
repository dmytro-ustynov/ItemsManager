import React, {useContext, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {fetcher} from "../utils/fetch_utils";
import {ADD_FIELD_URL, ALERT_LEVEL, BASE_URL, FIELDS, SAVE_NOTE_URL} from "../utils/constants";
import {Button, Table, TableBody, TableCell, TableRow, TextField, Typography} from "@mui/material";
import {useAuthState} from "./auth/context";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import MenuItem from "@mui/material/MenuItem";
import RootItemActions from "./RootItemActions";

function ItemInfo(props) {
    let item = props.item
    let mode = props.mode || 'list'
    const [attributes, setAttributes] = useState([])
    const [noteText, setNoteText] = useState('')
    const [saveClicked, setSaveClicked] = useState(false)
    const [pendingRequest, setPendingRequest] = useState(false)
    const [errorRequest, setErrorRequest] = useState(false)
    const [showNewField, setShowNewField] = useState(false)
    const [newFieldName, setNewFieldName] = useState("")
    const [newFieldValue, setNewFieldValue] = useState("")
    const [errorMessage, setErrorMessage] = useState(null)
    const [newFieldOptions, setNewFieldOptions] = useState([])

    const state = useAuthState()
    const user = state.user

    const store = useContext(StoreContext)
    const {setMessage, setAlertLevel, clearMessage, addItemField, fields} = store
    const navigate = useNavigate();

    useEffect(() => {
        let attrs = []
        Object.entries(item).forEach(([key, value], number) => {
            attrs.push([key, value])
        })
        setAttributes(attrs)
        setNoteText(item.notes)
    }, [item])
    // console.log(store.items.length)

    useEffect(() => {
        // we get options for New Field name from backend
        setNewFieldOptions(fields)
    }, [fields])

    const handleNoteInput = (event) => {
        setNoteText(event.target.value)
        setSaveClicked(false)
    }
    const handleNoteSubmit = async () => {
        setSaveClicked(true)
        setPendingRequest(true)

        const url = BASE_URL + SAVE_NOTE_URL
        const payload = {object_id: item._id, note: noteText}
        const data = await fetcher({payload, url, method: "POST", credentials: true})
        setPendingRequest(false)
        if (data.result === false) setErrorRequest(true)
    }
    const submitDisabled = () => {
        return !(noteText && noteText.length > 0 && noteText !== item.notes)
    }
    const handleAddFieldClick = () => {
        setShowNewField(true)
    }
    const addFieldSubmit = async (e) => {
        e.preventDefault();
        const payload = {item_id: item._id, payload: {newFieldName, newFieldValue}}
        console.log(payload)
        const url = BASE_URL + ADD_FIELD_URL
        const result = await fetcher({url, payload, credentials: true, method: "POST"})
        if (result.result === true) {
            addItemField(item.id, newFieldName, newFieldValue)
            setAttributes([...attributes, [newFieldName, newFieldValue]])
            setMessage('Новий атрибут збережено')
            setAlertLevel(ALERT_LEVEL.INFO)
        } else {
            console.log(result)
            setAlertLevel(ALERT_LEVEL.WARNING)
            setMessage('Помилка при збереженні, спробуйте ще раз')
        }
        setShowNewField(false)
    }
    const dropNewField = () => {
        setShowNewField(false)
        setNewFieldName('')
        setNewFieldValue('')
        setErrorMessage('')
    }
    const handleNewFieldNameInput = (event) => {
        setNewFieldName(event.target.value)
        if (Object.keys(item).includes(event.target.value)) {
            setErrorMessage('Такий атрибут вже існує')
        } else {
            clearMessage()
            setErrorMessage('')
        }
    }
    const handleNewFieldValueInput = (event) => {
        setNewFieldValue(event.target.value)
    }
    const validateNewFieldSubmit = () => {
        return !newFieldName || !newFieldValue || Object.keys(item).includes(newFieldName)
    }

    const forbiddenKeys = [FIELDS.NAME, "_id", "updated_at", "service_number", "notes", "inventory"]

    return (
        <div className={"item-info"}>
            <div style={{flex: 1, margin: "5px 0 5px 5px"}}>
                <Table className={"table-item-info"} size="small">
                    <TableBody>
                        {attributes.map(([key, value], number) => {
                            return (
                                !forbiddenKeys.includes(key) &&
                                (<TableRow key={`${key}-${number}`}>
                                    <TableCell style={{color: "white"}}> {key} </TableCell>
                                    <TableCell style={{color: "white"}}> {value} </TableCell>
                                </TableRow>)
                            )
                        })}
                    </TableBody>
                </Table>
                {user.username === 'root' && <RootItemActions item={item}/>}
            </div>
            <div style={{flex: 1, margin: "5px"}}>
                {((noteText && noteText.length > 0) || user.role !== 'anonymous') && (
                    <div className={'note-input-block'}>
                        <Typography variant="subtitle1" sx={{color: 'black'}}>Примітка:</Typography>
                        <textarea name="" id="" rows={noteText?.length > 100 ? 5 : 2}
                                  sx={{borderRadius: "0.5rem"}}
                                  value={noteText}
                                  disabled={user.role === 'anonymous'}
                                  onInput={handleNoteInput}/>
                        <div className="note-input-button">
                            {user.role !== 'anonymous' &&
                                <Button variant="contained" color="success" onClick={handleNoteSubmit}
                                        disabled={submitDisabled()}>ЗБЕРЕГТИ примітку</Button>}
                        </div>
                        <div>
                            {saveClicked && pendingRequest && (
                                <div className="spinner-border text-info center" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>)}
                            {saveClicked && !pendingRequest && !errorRequest &&
                                <span className={"text-success"}>saved</span>}
                            {saveClicked && !pendingRequest && errorRequest &&
                                <span className={"text-danger"}>error</span>}
                        </div>
                        <div style={{display: "flex", justifyContent: "center"}}>
                            {showNewField && (
                                <div className="new-fields-block">
                                    <form name="new_field_form" onSubmit={addFieldSubmit}>
                                        <TextField
                                            color="info"
                                            select
                                            sx={{m: 1, width: "200px"}}
                                            error={!!errorMessage}
                                            helperText={errorMessage}
                                            margin="dense"
                                            value={newFieldName}
                                            onChange={handleNewFieldNameInput}
                                            label="Новий атрибут">
                                            {newFieldOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>))}
                                        </TextField>

                                        <TextField color="info"
                                                   margin="dense"
                                                   sx={{m: 1}}
                                                   value={newFieldValue}
                                                   onChange={handleNewFieldValueInput}
                                                   label="Значення"/>
                                        <div className={'new-field-actions'}>
                                            <Button onClick={dropNewField}>cancel</Button>
                                            <Button type="submit"
                                                    variant="contained"
                                                    color="success"
                                                    endIcon={<SaveIcon/>}
                                                    disabled={validateNewFieldSubmit()}>зберегти</Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {user.role !== 'anonymous' &&
                                <Fab onClick={handleAddFieldClick} color='success'
                                     title="Додати новий атрибут"
                                     size="large"
                                     style={{
                                         display: showNewField === true ? "none" : "block",
                                         animation: 'show 200ms'
                                     }}>
                                    <AddIcon/>
                                </Fab>
                            }
                        </div>
                    </div>
                )
                }
                {mode === 'list' ? <Link to={`/item/?item_id=${item._id}`}>докладніше ...</Link> :
                    <Link to={"/"}>назад</Link>
                }
            </div>
        </div>
    )
}

export default observer(ItemInfo);