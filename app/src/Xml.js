import logo from "./logo.svg";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function XML() {
    const [sshOutput, setSshOutput] = useState();
    const jobUuid = useParams();

    useEffect(() =>{
        fetch(`/${jobUuid}/ssh`)
            .then(response => response.text())
            .then(data => setSshOutput(data))
    })

    return (
        <div className="XML">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    <code>{sshOutput}</code>
                </p>
            </header>
        </div>
    );
}

export default XML;
