import './App.css';
import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import Job from "./Job"
import Tests from "./Tests";
import Widget from "./Widget"
import Runner from "./Runner"
import React from 'react';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route index element={<NoJob />} />
                        <Route path=":jobUuid" element={<Job />} />
                        <Route path="tests/:runnerIp/:fileName" element={<Tests />}/>
                        <Route path="runner/:runnerIp" element={<Runner />}/>
                        <Route path="widget/:jobUuid" element={<Widget />}/>
                        <Route path="*" element={<NoMatch />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

function NoJob() {
    return (
        <div>
            <h2>Nothing to see here! Please provide a job UUID!</h2>
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
