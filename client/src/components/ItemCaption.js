export default function ItemCaption (props){
    const item = props.item
    let bulletType = "bullet "
    let bulletTitle
    if (item.service_number === 1) {
        bulletType += "service_vnlz"
        bulletTitle = "ВНЛЗ"
    } else if (item.service_number === 2) {
        bulletType += "service_sz"
        bulletTitle = "Служба зв'язку"
    }  else {
        bulletType += "default"
    }
    return (
        <div className={"item-title"}>
            <span className={bulletType} title={bulletTitle}>&#10687;	</span>	<span> {item.найменування}</span>
        </div>
    )
}