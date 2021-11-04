import './App.css';
import {BrowserRouter, Route, Routes, } from "react-router-dom";
import Default from "./Default";
import XML from "./Xml"

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Default />} />
                    <Route path="/:jobUuid" element={<XML />} />
                </Routes>
            </BrowserRouter>,
        </div>
    );
}

export default App;
