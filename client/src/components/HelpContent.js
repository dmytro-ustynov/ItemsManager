import {Typography} from "@mui/material";
import {helpMessages} from "./helpContentMessages";
import img1 from "../images/img3.png"
import {BASE_URL} from "../utils/constants";

export default function HelpContent({lang}) {
    return (<div>
            <Typography variant="h5" id="#Title">{helpMessages.t1[lang]}</Typography>
            <Typography variant="h6" id="#Chapter1">{helpMessages.c1[lang]}</Typography>
            <p className="help-text-paragraph">{helpMessages.m1[lang]}
                <a href={`${BASE_URL}/docs#/user/user_signup_user_signup_post.`}>signup</a>.&nbsp;
                {helpMessages.m1_1[lang]}</p>
            <img src={img1} alt="" width="50%"/>

            <p className="help-text-paragraph">{helpMessages.m1_2[lang]}</p>

            <Typography variant="h6" id="#Chapter2">{helpMessages.c2[lang]}</Typography>
            <p className="help-text-paragraph">{helpMessages.m2_1[lang]}</p>
            <ul className="help-text-paragraph" style={{backgroundColor: "#282c34", width: "70%"}}>
                <li><span style={{color: "wheat"}}> ⦿ "wheat"</span></li>
                <li><span style={{color: "green"}}> ⦿  "green"</span></li>
                <li><span style={{color: "#0a58ca"}}> ⦿ "#0a58ca"</span></li>
                <li><span style={{color: "#90afea"}}> ⦿ "#90afea"</span></li>
            </ul>
            <Typography variant="h6" id="#Chapter3">{helpMessages.c3[lang]}</Typography>
            <p className="help-text-paragraph" style={{marginBottom: 0}}>{helpMessages.m3[lang]}</p>
            <ul className="help-text-paragraph">
                {helpMessages.m3_list[lang].map((i) => {
                        return <li>{i}</li>
                    }
                )
                }
            </ul>
            <p className="help-text-paragraph">{helpMessages.m3_1[lang]}</p>
            <p className="help-text-paragraph">{helpMessages.m3_2[lang]}</p>
        </div>
    )
}