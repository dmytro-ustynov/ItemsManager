import logoImage from "../images/logo_640.jpg";
import HeaderMenu from "./HeaderMenu";

export default function Header(){
    return (
        <header className="top-header">
            <div className="header-left-menu" />
            <img src={logoImage} alt={"logo"} className={"image-logo"}
                 onClick={()=>{window.location.replace("/")}}/>
            <h1>Mайно кафедри </h1>
            <HeaderMenu />
        </header>
    )
}