import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, FormControl, InputLabel,
    TextField, Typography
} from "@mui/material";
import Select from '@mui/material/Select';
import SaveIcon from "@mui/icons-material/Save";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import {useContext, useState} from "react";
import {useAuthState} from "./auth/context";
import MenuItem from "@mui/material/MenuItem";
import {fetcher} from "../utils/fetch_utils";
import {ALERT_LEVEL, BASE_URL, CREATE_ITEM_URL} from "../utils/constants";
import {StoreContext} from "../store/store";
import {SERVICES} from "../generated_constants";

export default function CreateHandlerPlus() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [name, setName] = useState('')
    const [inventoryNumber, setInventoryNumber] = useState('')
    const [service, setService] = useState('')
    const [year, setYear] = useState('')
    const [serial, setSerial] = useState('')
    const state = useAuthState()
    const user = state.user

    const store = useContext(StoreContext)
    const {setMessage, setAlertLevel} = store

    const createHandler = async () => {
        const url = BASE_URL + CREATE_ITEM_URL
        const payload = {name, service, inventory_number: inventoryNumber}
        if (!!year) {
            payload.year = year
        }
        if (!!serial) {
            payload.serial = serial
        }
        const response = await fetcher({url, payload, credentials: true})
        if (response.result === true) {
            setCreateDialogOpen(false)
            setAlertLevel(ALERT_LEVEL.INFO)
            setMessage('Новий елемент добавлено')
            clearForm()
        } else {
            if (response.status > 400) {
                setAlertLevel(ALERT_LEVEL.WARNING)
                setMessage('НЕМОЖЛИВО СТВОРИТИ НОВИЙ ЕЛЕМЕНТ, ПЕРЕВІРТЕ ВВЕДЕНІ ДАНІ')
            }
        }
    }

    const validateCreationForm = () => {
        return !name || !inventoryNumber || !service || name.length < 5 || inventoryNumber.length < 5
    }

    const handleServiceChange = (event) => {
        setService(event.target.value)
    }
    const handleNameChange = (event) => {
        setName(event.target.value)
    }
    const handleInventoryChange = (event) => {
        setInventoryNumber(event.target.value)
    }
    const handleYearChange = (event) => {
        setYear(event.target.value)
    }
    const handleSerialChange = (event) => {
        setSerial(event.target.value)
    }
    const clearForm = () => {
        setName('')
        setService('')
        setInventoryNumber('')
        setSerial('')
        setYear('')
    }

    return <div>
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
            <DialogTitle
                sx={{
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'center'
                }}>Створення елементу</DialogTitle>
            <DialogContent sx={{display: "flex", flexDirection: "column", width: "50vh", maxWidth: "100%"}}>
                <TextField label="Найменування" variant="outlined"
                           margin="dense"
                           helperText="Має бути довше ніж 5 символів"
                           required
                           value={name}
                           onChange={handleNameChange}/>
                <TextField label="Інвентарний номер" variant="outlined"
                           margin="dense"
                           helperText="Має бути довше ніж 5 символів"
                           required
                           value={inventoryNumber}
                           onChange={handleInventoryChange}/>
                <FormControl margin="dense">
                    <InputLabel id="serviceSelect">Служба *</InputLabel>
                    <Select
                        labelId="serviceSelect"
                        value={service}
                        required
                        label="Служба *"
                        onChange={handleServiceChange}>
                        {Object.keys(SERVICES).map(key => (
                            <MenuItem key={key}
                                      value={SERVICES[key].alias.toUpperCase()}>{SERVICES[key].name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="h6" sx={{marginTop: '15px'}}>Необов'язково</Typography>
                <TextField label="Серійний/заводський номер" variant="filled"
                           sx={{width: "80%"}}
                           margin="normal"
                           value={serial}
                           onChange={handleSerialChange}/>
                <TextField label="Рік виготовлення" variant="filled"
                           sx={{width: "80%"}}
                           margin="dense"
                           value={year}
                           onChange={handleYearChange}/>
            </DialogContent>
            <DialogActions sx={{m: 2.5}}>
                <Button onClick={() => {
                    setCreateDialogOpen(false);
                    clearForm()
                }}> Cancel </Button>
                <Button variant="contained"
                        color="success"
                        onClick={createHandler}
                        endIcon={<SaveIcon/>}
                        disabled={validateCreationForm()}> зберегти </Button>
            </DialogActions>
        </Dialog>
        {user.role === 'registered' && <Fab disabled={user.is_active !== true}
                                            color="primary" title="Створити новий елемент"
                                            aria-label="add" onClick={() => {
            setCreateDialogOpen(true)
        }}>
            <AddIcon/>
        </Fab>
        }
    </div>
}