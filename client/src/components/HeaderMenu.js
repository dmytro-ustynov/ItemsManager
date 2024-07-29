import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton, ListItemIcon, ListItemText,
} from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useContext, useState} from "react";
import {Roles, useAuthDispatch, useAuthState} from "./auth/context";
import {BASE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils"
import {authTypes} from "./auth/reducer";
import FileUploadForm from "./FileUploadForm";
import {StoreContext} from "../store/store";
import {useNavigate} from "react-router-dom";
import LoginComponent from "./LoginComponent";

export default function HeaderMenu() {
    const state = useAuthState()
    const user = state.user
    const store = useContext(StoreContext)
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDocsDialog, setOpenDocsDialog] = useState(false);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);

    const dispatch = useAuthDispatch()
    // menu logic
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickLoginMenu = () => {
        setAnchorEl(null);
        dispatch({type: authTypes.OPEN_LOGIN_FORM})
    }
    const userTitle = user.role === Roles.ANONYMOUS ? "Anonymous user, click Login" : user.username

    const handleLogout = async () => {
        store.setItems([])
        handleClose()
        dispatch({type: authTypes.LOGOUT});
        const url = BASE_URL + '/auth/logout'
        await fetcher({url, credentials: true})
    }
    const closePopUp = () => {
        setOpenDocsDialog(false)
        setAnchorEl(null);
    }
    const accountClick = () => {
        if (user.username === 'root') {
            navigate('/settings')
        }
        handleClose()
    }

    return (<>
            <Menu id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                      'aria-labelledby': 'basic-button',
                  }}>
                {user.role === Roles.ANONYMOUS &&
                    <MenuItem onClick={handleClickLoginMenu}>
                        <ListItemIcon><LoginIcon/> </ListItemIcon>
                        <ListItemText>Login</ListItemText>
                    </MenuItem>}
                <MenuItem onClick={accountClick} disabled={user.role === Roles.ANONYMOUS}>
                    {user.role === Roles.ANONYMOUS ? (<><ListItemIcon><ManageAccountsIcon/> </ListItemIcon>
                            <ListItemText>My account</ListItemText></>) :
                        <><ListItemIcon>{user.is_active === true ? <ManageAccountsIcon/> :
                            <ReportProblemOutlinedIcon title={"Необхідно активувати акаунт"}/>}
                        </ListItemIcon>
                            <ListItemText>{user.username}</ListItemText></>
                    }
                </MenuItem>
                {user.role !== Roles.ANONYMOUS &&
                    <MenuItem disabled={user.is_active !== true}
                              onClick={() => {
                                  setOpenUploadDialog(true);
                                  setAnchorEl(null)
                              }}>
                        <ListItemIcon><UploadFileIcon/> </ListItemIcon>
                        <ListItemText>Масова загрузка з Excel</ListItemText>
                    </MenuItem>}
                <MenuItem onClick={() => setOpenDocsDialog(true)}>
                    <ListItemIcon><LibraryBooksIcon/> </ListItemIcon>
                    <ListItemText>Документи</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => window.location = "/help"}>
                    <ListItemIcon><HelpCenterIcon/> </ListItemIcon>
                    <ListItemText>Допомога</ListItemText>
                </MenuItem>
                {user.role !== Roles.ANONYMOUS && <Divider/>}
                {user.role !== Roles.ANONYMOUS &&
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon/> </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                    </MenuItem>}
            </Menu>

            <Dialog open={openDocsDialog} onClose={closePopUp}>
                <DialogTitle>Документи</DialogTitle>
                <DialogContent>
                    <ul>
                        <li>
                            <a href="/postanova" target="_blank" rel="noreferrer noopener"
                               title="Постанова про затвердження положення про інвентаризацію військового майна">Постанова
                                Кабінету міністрів Про затвердження Положення про інвентаризацію
                                військового майна у Збройних Силах</a>
                        </li>
                        <li>
                            <a href="/nakaz" target="_blank" rel="noreferrer noopener"
                               title="Наказ про затвердження інструкції з обліку військового майна">Наказ №440 Про
                                затвердження Інструкції з обліку військового майна у Збройних Силах України</a>
                        </li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePopUp}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openUploadDialog}
                    onClose={() => setAnchorEl(null)}>
                <FileUploadForm open={openUploadDialog}
                                setOpen={setOpenUploadDialog}/>
            </Dialog>
            <div className="header-right-menu">
                <IconButton
                    color={user.role === "registered" ? "primary" : "default"}
                    onClick={handleClick} title={userTitle}>
                    <AccountCircleIcon/>
                </IconButton>
            </div>
            <LoginComponent/>
        </>
    )
}