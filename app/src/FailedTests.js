import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Box from '@mui/material/Box';

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
                <Box sx={{
                    backgroundColor: failedTestData.length > 0 ? "error.main" : "success.main",
                    borderRadius: 16,
                    width: 300,
                    textAlign: 'center',
                }}>
                    <span style={{verticalAlign: 'middle'}}>
                        {failedTestData.length > 0 ? `${failedTestData.length} tests failed!` : "All tests passed!"}
                    </span>

                </Box>
                <ul style={{textAlign: "left"}}>
                    {failedTestData.map(data => <li><a href={`/stdout/${fileName}/${data.id}`}>{data.text}</a></li>)}
                </ul>
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
