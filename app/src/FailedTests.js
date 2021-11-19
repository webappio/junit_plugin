import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function FailedTests() {
    const [failedIds, setFailedIds] = useState([]);
    let { fileName } = useParams();

    useEffect(() => {
        (async function() {
            await fetch(`/api/failed-tests/${fileName}`)
                .then(response => response.json())
                .then(data => setFailedIds(data))
        })()
    }, [])

    return (
        <div className="Default">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                {failedIds.map(id =>
                    <li><a href={`/stdout/${fileName}/${id}`}>{id}</a></li>
                )}
            </header>
        </div>
    );
}

export default FailedTests;
