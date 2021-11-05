import './App.css';
import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import Default from "./Default";
import XML from "./Xml"

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route index element={<Default/>} />
                        <Route path=":jobUuid" element={<XML />} />
                        {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
                        <Route path="*" element={<NoMatch />} />
                    </Route>
                </Routes>
            </BrowserRouter>,
        </div>
    );
}

function NoMatch() {
    return (
        <div>
            <h2>Nothing to see here!</h2>
            <p>
                <Link to="/">Go to the home page</Link>
            </p>
        </div>
    );
}

export default App;
