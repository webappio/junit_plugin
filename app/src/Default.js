import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from "react";

function Default() {
    const [xml, setXml] = useState('');

    useEffect(() =>{
        fetch('/xml')
            .then(response => response.text())
            .then(data => setXml(data))
    })

    let xmlFiles = xml.split('\n');

    return (
        <div className="Default">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                {xmlFiles.map(file =>
                    <a
                        className="App-link"
                        href={"/xml/"+file}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {file}
                    </a>
                )}
            </header>
        </div>
    );
}

export default Default;
