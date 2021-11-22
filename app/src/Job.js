import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function Job() {
    const [xml, setXml] = useState('');
    const [sshOutput, setSshOutput] = useState('');
    let { jobUuid } = useParams();

    let xmlFiles = xml.split('\n');

    useEffect(() =>{
        fetch('/api/xml')
            .then(response => response.text())
            .then(data => setXml(data))
        fetch(`/api/ssh/${jobUuid}`)
            .then(response => response.text())
            .then(data => setSshOutput(data))
        console.log(sshOutput)
    })

    return (
        <div className="Default">
            <header className="App-header">
                <p>
                    All JUnit XML files for job {jobUuid}
                </p>
                {xmlFiles.map(fileName =>
                    <a
                        className="App-link"
                        href={"/failed-tests/"+fileName}
                        rel="noopener noreferrer"
                    >
                        {fileName}
                    </a>
                )}
            </header>
        </div>
    );
}

export default Job;
