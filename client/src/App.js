import './App.css';
import './generated.css';
import {Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import DocPage from "./pages/DocPage";


function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/nakaz" element={<DocPage file={'nakaz'}/>}/>
                <Route path="/postanova" element={<DocPage file={'postanova'}/>}/>
            </Routes>
        </div>
    );
}

export default App;
