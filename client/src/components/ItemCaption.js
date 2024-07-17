import {SERVICES} from "../generated_constants";

export default function ItemCaption(props) {
    const item = props.item
    let bulletType = SERVICES[item.service_number] ? `service_${SERVICES[item.service_number].alias}` : "default"
    let bulletTitle = SERVICES[item.service_number] ? SERVICES[item.service_number].name : ""

    return (
        <div className={"item-title"}>
            <span className={`bullet ${bulletType}`} title={bulletTitle}>&#10687;	</span>
            <span>{item.найменування}</span>
        </div>
    )
}