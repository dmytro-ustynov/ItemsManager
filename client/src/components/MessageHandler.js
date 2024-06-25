import Snackbar from "@mui/material/Snackbar";
import React, {useContext} from "react";
import {StoreContext} from "../store/store";
import MuiAlert from "@mui/material/Alert";
import {observer} from "mobx-react";


const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// severity: info, warning

function MessageHandler() {
    const store = useContext(StoreContext)
    const {message, setMessage, alertLevel} = store

    return (
        <Snackbar
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            open={!!message}
            onClose={() => setMessage(null)}>
            <Alert onClose={() => setMessage(null)} severity={alertLevel} sx={{width: '100%'}}>{message}</Alert>
        </Snackbar>
    )
}

export default observer(MessageHandler)