import logoImage from "../images/logo_640.jpg";
import HeaderMenu from "./HeaderMenu";
import {MAIN_TITLE} from "../generated_constants";

export default function Header(){
    return (
        <header className="top-header">
            <div className="header-left-menu" />
            <img src={logoImage} alt={"logo"} className={"image-logo"}
                 onClick={()=>{window.location.replace("/")}}/>
            <h1>{MAIN_TITLE}</h1>
            <HeaderMenu />
        </header>
    )
}