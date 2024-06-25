import {fetcher} from "../utils/fetch_utils"
import {Button, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {useState} from "react";
import {BASE_URL} from "../utils/constants";

export default function FileUploadForm({open, setOpen}) {
    const [file, setFile] = useState(null)
    const [formReady, setFormReady] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [validTitles, setValidTitles] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [uploadResult, setUploadResult] = useState(null)
    const [uploadCount, setUploadCount] = useState(null)
    const submitUpload = async (event) => {
        event.preventDefault()

        const body = new FormData()
        body.append('file', file)
        const url = BASE_URL + '/files/bulk_upload'
        const res = await fetcher({url, body})
        if (res.result === true) {
            setUploadResult(true)
            setUploadCount(res.total_items_created)
        } else {
            setUploadResult(null)
        }
        setFormReady(false)
        setValidTitles([])
    }

    const handleFileSelected = async (event) => {
        setUploadResult(null)
        setUploadCount(null)
        const tempFile = event.target.files[0];
        // console.log(tempFile.type)
        if (tempFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setErrorMsg('Not valid xls ')
        }
        const reader = new FileReader();

        reader.onloadend = async () => {
            setFile(tempFile);
            const body = new FormData()
            body.append('file', tempFile)
            const url = BASE_URL + '/files/validate_xls'
            const res = await fetcher({url, body})
            if (res.result === true) {
                setValidTitles(res.titles)
                setTotalItems(res.total_rows)
                setFormReady(true)
            } else {
                setFormReady(false)
            }
        };
        reader.readAsDataURL(tempFile)
    }

    return (
        <form action="">
            <DialogTitle>Масова загрузка. Оберіть файл</DialogTitle>
            <DialogContent>
                <Typography variant={'h5'}></Typography>
                <Button variant="contained" component="label">
                    Файл:
                    <input type="file" accept=".xls,.xlsx" hidden onChange={handleFileSelected}/>
                </Button>
                {!!errorMsg && <Typography variant={'helperText'}>{errorMsg}</Typography>}
                {validTitles && validTitles.length > 0 && (<>
                        <div>
                            У файлі знайдено <strong>{totalItems} </strong>записів із наступними колонками.
                            <ul>
                                {validTitles.map(t => {
                                    return (<li key={t}>{t}</li>)
                                })}
                            < /ul>
                            <Typography>Натисніть кнопу Upload для поповнення бази даних</Typography>
                        </div>
                    </>
                )}
                {uploadResult && <> Завантажено <strong>{uploadCount}</strong> нових елементів.</>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submitUpload} disabled={!formReady} type={'submit'}>Upload</Button>
            </DialogActions>
        </form>
    )
}