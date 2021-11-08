import logo from "./logo.svg"
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function XML() {
    const [sshOutput, setSshOutput] = useState();
    const [xml, setXml] = useState('');
    let { jobUuid } = useParams();

    useEffect(() =>{
        fetch(`/ssh/${jobUuid}`)
            .then(response => response.text())
            .then(data => setSshOutput(data))
        fetch('/xml')
            .then(response => response.text())
            .then(data => setXml(data))
    })

    let xmlFiles = xml.split('\n');
    console.log(sshOutput)

    return (
        <div className="Xml">
            <header className="App-header">
                <p>
                    All JUnit XML reports for job {jobUuid}:
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

export default XML;
