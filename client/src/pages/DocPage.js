function DocPage({file}) {
    const sources = {
        nakaz: "/static_docs/nakaz-440-vid-17_08_2017-pro-zatverdzhennja-instrukciji-z-obliku-vijskovogo-majna-u-zbrojnih-silah-ukrajini.pdf",
        postanova: "/static_docs/postanova-748-vid-03_05_2000-pro-zatverdzhennja-polozhennja-pro-inventarizaciju-vijskovogo-majna-u-zbrojnih-silah.pdf"
    }
    return (
        <div className="doc">
            <embed
                src={sources[file]}
                type="application/pdf" width="100%" height="1024px"/>
        </div>
    );
}

export default DocPage;