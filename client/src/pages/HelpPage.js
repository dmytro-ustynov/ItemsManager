import Header from "../components/Header";
import Footer from "../components/Footer";
import React, {useState} from "react";
import HelpContent from "../components/HelpContent";


export default function HelpPage() {
    const [lang, setLang] = useState('UA')
    // const [content, setContent] = useState('')

    const switchContentLang = () => {
        const switcher = {"UA": "EN", "EN": "UA"}
        setLang(switcher[lang])
    }

    return (
        <>
            <Header/>
            <div style={{cursor: "pointer", display: "flex", justifyContent: "end", marginRight: "30px"}}>
                <div onClick={switchContentLang}
                     className={lang === "UA" ? "active-lang" : "inactive-lang"}>UA
                </div>
                <div style={{margin: "0 10px"}}> | </div>
                <div onClick={switchContentLang}
                     className={lang === "EN" ? "active-lang" : "inactive-lang"}>EN
                </div>
            </div>

            <div style={{minHeight: "80vh"}}>
                <HelpContent lang={lang}/>
            </div>
            <Footer/>
        </>
    )
}