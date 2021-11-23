import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function FailedTests() {
    const [failedTestData, setFailedTestData] = useState([]);
    let { fileName } = useParams();

    useEffect(() => {
        (async function() {
            await fetch(`/api/failed-tests/${fileName}`)
                .then(response => response.json())
                .then(data => setFailedTestData(data))
        })()
    }, [fileName])

    return (
        <div className="Default">
            <header className="App-header">
                <p>
                    List of failed tests:
                </p>
                {
                    failedTestData.map(data => <li><a href={`/stdout/${fileName}/${data.id}`}>{data.text}</a></li>)
                }
                <p>
                    Full JUnit XML report:
                </p>
                {
                    <a href={`/xml/${fileName}`}>{fileName}</a>
                }
            </header>
        </div>
    );
}

export default FailedTests;
