import './App.css';
import './generated.css';
import {Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import DocPage from "./pages/DocPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import Page404 from "./pages/Page404";
import ItemPage from "./pages/ItemPage";
import {StoreProvider} from "./store/store";
import RootUserPage from "./pages/RootUserPage";


function App() {
    return (
        <StoreProvider>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/nakaz" element={<DocPage file={'nakaz'}/>}/>
                    <Route path="/postanova" element={<DocPage file={'postanova'}/>}/>
                    <Route path="/help" element={<HelpPage/>}/>
                    <Route path="/item" element={<ItemPage/>}/>
                    <Route path="/settings" element={<RootUserPage/>}/>
                    <Route path="*" element={<Page404/>}/>
                </Routes>
            </div>
        </StoreProvider>
    );
}

export default App;
