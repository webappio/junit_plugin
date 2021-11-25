import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Box from '@mui/material/Box';
import {Button, Typography} from "@mui/material";

function Tests() {
    const [failedTestData, setFailedTestData] = useState([]);
    const [testCounts, setTestCounts] = useState({})
    let { fileName } = useParams();

    useEffect(() => {
        (async function() {
            await fetch(`/api/tests/${fileName}`)
                .then(response => response.json())
                .then(data => setTestCounts(data))
            console.log(testCounts)
            await fetch(`/api/failed-tests/${fileName}`)
                .then(response => response.json())
                .then(data => setFailedTestData(data))
        })()
    }, [fileName, testCounts])

    return (
        <div className="Tests">
            <header className="App-header">
                <Box margin={3}>
                    {
                        testCounts ? <>
                            <Box margin={3} display="flex" flexDirection="row">
                                <Box display="flex" width="30vw"/>
                                <Box
                                    display="flex"
                                    flexGrow={1}
                                    justifyContent="center"
                                    flexDirection="row"
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 300,
                                            height: 150,
                                            backgroundColor: '#258271',
                                            borderRadius: 5
                                        }}
                                    >
                                        <Typography style={{color: "#FFFFFF"}} variant="h4">
                                            Passed: {testCounts.testCount - testCounts.failedCount}
                                        </Typography>
                                    </Box>
                                    <Box
                                        marginLeft={5}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 300,
                                            height: 150,
                                            backgroundColor: '#C65858',
                                            borderRadius: 5
                                        }}
                                    >
                                        <Typography style={{color: "#FFFFFF"}} variant="h4">
                                            Failures: {testCounts.failedCount}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" width="30vw"/>
                            </Box>
                            <Box display="flex" flexDirection="column">
                                {failedTestData.map(data => {
                                    return(
                                        <Box
                                            key={data.id}
                                            margin={2}
                                            display="flex"
                                            flexDirection="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            padding={3}
                                            sx={{
                                                border: 1,
                                                borderLeft: 10,
                                                borderColor: '#C65858'
                                            }}
                                        >
                                            <Box display="flex" width="25%">
                                                <Typography>
                                                    {data.text}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" width="25%" justifyContent="right">
                                                <Button
                                                    variant="outlined"
                                                    style={{
                                                        color: '#C65858',
                                                        borderColor: '#C65858',
                                                        textTransform: "none"
                                                    }}
                                                    href={`/stdout/${fileName}/${data.id}`}
                                                >
                                                    View stdout
                                                </Button>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </> : null
                    }
                </Box>
                <p>
                    Full JUnit XML report: <a href={`/xml/${fileName}`}>{fileName}</a>
                </p>
            </header>
        </div>
    );
}

export default Tests;
