export default function Footer(){
    const d = new Date()
    return(
        <footer>
            &#169; Ustynov Dmytro, {d.getFullYear()}
        </footer>
    )
}