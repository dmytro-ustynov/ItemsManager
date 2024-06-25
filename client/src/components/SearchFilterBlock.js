import {
    Button, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel, Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import {useContext, useState} from "react";
import {BASE_URL, CATEGORIES, EXPORT_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import excelIcon from "../images/excel-42-32.png";
import filterIcon from "../images/filter-44-32.png";
import CreateHandlerPlus from "./CreateHandlerPlus";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";

function SearchFilterBlock() {
    const store = useContext(StoreContext)
    const {items, dropFilters, filterItems} = store

    const [searchString, setSearchString] = useState("")
    const [filterDialogOpen, setFilterDialogOpen] = useState(false)
    const [olderThanYear, setOlderThanYear] = useState("")
    const [youngerThanYear, setYoungerThanYear] = useState("")
    const [selectedService, setSelectedService] = useState("")
    const [computersChecker, setComputersChecker] = useState(false)
    const [projectorsChecker, setProjectorsChecker] = useState(false)
    const [communicationsChecker, setCommunicationsChecker] = useState(false)
    const [sedoChecker, setSedoChecker] = useState(false)
    const [softChecker, setSoftChecker] = useState(false)

    const handleInput = (event) => {
        const searchStr = event.target.value
        setSearchString(searchStr)
        if (!searchStr) {
            dropFilters()
        } else {
            if (searchStr.length > 3) {
                filterItems({search: searchStr})
            }
        }
    }
    const handleExportButton = async () => {
        let item_ids = []
        items.map((i) => item_ids.push(i._id))
        const url = BASE_URL + EXPORT_URL
        const result = await fetcher({url, method: "POST", payload: {item_ids: item_ids}, asFile: true})
        const blobUrl = window.URL.createObjectURL(result)
        const anchor = document.createElement("a")
        anchor.href = blobUrl
        anchor.download = "items.xls"
        anchor.click()
    }
    const handleFilterModalDialog = () => {
        setFilterDialogOpen(true)
    }
    const clearFilters = () => {
        setSelectedService("")
        setOlderThanYear("")
        setYoungerThanYear("")
        setComputersChecker(false)
        setCommunicationsChecker(false)
        setProjectorsChecker(false)
        setSedoChecker(false)
        dropFilters()
        setFilterDialogOpen(false)
    }
    const applyFilters = async () => {
        let filter = {}
        if (youngerThanYear !== "") filter.younger_than = youngerThanYear;
        if (olderThanYear !== "") filter.older_than = olderThanYear;
        if (selectedService !== "") {
            if (selectedService === "noService") {
                filter.noService = true
            } else {
                filter.service = selectedService;
            }
        }

        let category = [];
        if (computersChecker) category.push(CATEGORIES.COMPUTERS);
        if (projectorsChecker) category.push(CATEGORIES.PROJECTORS);
        if (communicationsChecker) category.push(CATEGORIES.COMMUNICATIONS);
        if (sedoChecker) category.push(CATEGORIES.SEDO);
        if (softChecker) category.push(CATEGORIES.SOFT);

        if (category.length > 0) filter.category = category;
        if (Object.entries(filter).length > 0) {
            if (searchString !== "") {
                filter.search = searchString
            }
            filterItems(filter)
        }
        setFilterDialogOpen(false)
    }
    const handleServiceChange = (event) => {
        const service = event.target.value
        if (selectedService === service) {
            setSelectedService("")
        } else {
            setSelectedService(service)
        }
    }
    const handleCategoryChange = (event) => {
        const category = event.target.value
        switch (category) {
            case CATEGORIES.COMPUTERS:
                setComputersChecker(!computersChecker);
                break
            case CATEGORIES.PROJECTORS:
                setProjectorsChecker(!projectorsChecker);
                break
            case CATEGORIES.COMMUNICATIONS:
                setCommunicationsChecker(!communicationsChecker)
                break
            case CATEGORIES.SEDO:
                setSedoChecker(!sedoChecker)
                break
            case CATEGORIES.SOFT:
                setSoftChecker(!softChecker)
                break
            default:
                setComputersChecker(false);
                setProjectorsChecker(false);
                setCommunicationsChecker(false);
        }
    }
    const handleOlderInput = (event) => {
        setOlderThanYear(event.target.value)
    }
    const handleYoungerInput = (event) => {
        setYoungerThanYear(event.target.value)
    }
    const validateFilters = () => {
        return !(youngerThanYear || olderThanYear || selectedService || computersChecker || projectorsChecker
            || sedoChecker || softChecker || communicationsChecker);
    }
    return (
        <div className={"search-handlers"}>
            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
                <DialogTitle>Налаштування фільтрів</DialogTitle>
                <DialogContent>
                    <div style={{padding: "0 0 15px", display: "flex", gap: "1.5em"}}>
                        <TextField variant="standard"
                                   label="Новіше ніж: "
                                   helperText="...року виготовлення"
                                   value={youngerThanYear}
                                   margin="dense"
                                   onChange={handleYoungerInput}/>
                        <TextField variant="standard"
                                   label="Старіше ніж: "
                                   helperText="...року виготовлення"
                                   value={olderThanYear}
                                   margin="dense"
                                   onChange={handleOlderInput}/>
                    </div>
                    <FormControl variant="filled">
                        <FormLabel style={{fontWeight: 600}}>Фільтрувати за службою</FormLabel>
                        <RadioGroup name="serviceRadioGroup"
                                    onChange={handleServiceChange}>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "VNLZ"} onClick={handleServiceChange}/>}
                                value="VNLZ"
                                label={"Тільки ВНЛЗ"}/>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "SZ"} onClick={handleServiceChange}/>}
                                value="SZ"
                                label="Тільки Служба зв'язку"/>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "noService"}
                                                onClick={handleServiceChange}/>}
                                value="noService"
                                label="Не на обліку"/>
                        </RadioGroup>
                        <FormLabel style={{fontWeight: 600}}>Фільтрувати за категоріями</FormLabel>
                        <FormControlLabel
                            control={<Checkbox checked={computersChecker} onChange={handleCategoryChange}/>}
                            value={CATEGORIES.COMPUTERS}
                            label="Комп'ютери"/>
                        <FormControlLabel
                            control={<Checkbox checked={projectorsChecker} onChange={handleCategoryChange}/>}
                            value={CATEGORIES.PROJECTORS}
                            label="Проектори"/>
                        <FormControlLabel
                            control={<Checkbox checked={communicationsChecker} onChange={handleCategoryChange}/>}
                            value={CATEGORIES.COMMUNICATIONS}
                            label="Комм. обладнання"/>
                        <FormControlLabel
                            control={<Checkbox checked={sedoChecker} onChange={handleCategoryChange}/>}
                            value={CATEGORIES.SEDO}
                            label="Обладнання СЕДО"/>
                        <FormControlLabel
                            control={<Checkbox checked={softChecker} onChange={handleCategoryChange}/>}
                            value={CATEGORIES.SOFT}
                            label="Програмне забезпечення"/>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setFilterDialogOpen(false);
                        clearFilters()
                    }}> Cancel </Button>
                    <Button onClick={clearFilters} disabled={validateFilters()}> Clear </Button>
                    <Button variant="contained" color="success" onClick={applyFilters}
                            disabled={validateFilters()}> Apply </Button>
                </DialogActions>

            </Dialog>
            <TextField autoFocus
                       sx={{minWidth: "200px"}}
                       variant="outlined"
                       label="Пошук"
                       color="info"
                       helperText="по назві або по інвентарному номеру, мінімум 4 символи"
                       onChange={handleInput}
            />
            <div>
                <Button variant="contained"
                        color="info"
                        title="Налаштування Фільтрів"
                        onClick={handleFilterModalDialog}>
                    <img src={filterIcon} height={30} alt="" style={{padding: "0 5px"}}/>
                </Button>
            </div>
            <div>
                <Button variant="contained"
                        color="success"
                        title="Зберегти в Excel"
                        disabled={items.length === 0}
                        onClick={handleExportButton}>
                    <img src={excelIcon} height={30} alt="" style={{padding: "0 5px"}}/>
                </Button>
            </div>
            <CreateHandlerPlus/>
        </div>
    )
}

export default observer(SearchFilterBlock)