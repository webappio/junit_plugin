import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Box from '@mui/material/Box';
import {Button, Typography, CircularProgress} from "@mui/material";

function Tests() {
    const [failedTestData, setFailedTestData] = useState([]);
    const [testsData, setTestsData] = useState({})
    const [loadTestData, setLoadTestData] = useState(true);
    const [loadFailedTestData, setLoadFailedTestData] = useState(true);
    let { fileName, jobUuid } = useParams();

    useEffect(() => {
        (async function() {
            await fetch(`/api/tests/${fileName}`)
                .then(response => response.json())
                .then(data => {
                    setTestsData(data);
                    setLoadTestData(false);
                })
            await fetch(`/api/failed-tests/${fileName}`)
                .then(response => response.json())
                .then(data => {
                    setFailedTestData(data);
                    setLoadFailedTestData(false);
                })
        })()
    }, [fileName])

    let passed = testsData.tests - testsData.failures

    return (
        <div className="Tests">
            <header className="App-header">
                <Box margin={3} width="100vw" maxWidth='100%' justifyContent="center" alignItems="center">
                    <Box display="flex" justifyContent="center">
                        <Box display="flex" style={{ width: "960px", maxWidth: "100%" }}>
                        <Button variant="outlined" size="large" style={{ marginLeft: "10px" }} href={`/${jobUuid}`}> Back </Button>
                        </Box>
                    </Box>
                    {
                        loadTestData ?
                        <CircularProgress />
                        :
                    <>
                    {
                        testsData ? <>
                            <Box margin={3} display="flex" flexDirection="row" justifyContent="center">
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    flexDirection="row"
                                    flexWrap="wrap"
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 300,
                                            height: 150,
                                            backgroundColor: '#258271',
                                            borderRadius: 5,
                                            margin: "10px"
                                        }}
                                    >
                                        <Typography style={{color: "#FFFFFF"}} variant="h4">
                                            Passed: {passed}
                                        </Typography>
                                    </Box>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 300,
                                            height: 150,
                                            backgroundColor: '#C65858',
                                            borderRadius: 5,
                                            margin: "10px"
                                        }}
                                    >
                                        <Typography style={{color: "#FFFFFF"}} variant="h4">
                                            Failures: {testsData.failures}
                                        </Typography>
                                    </Box>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            width: 300,
                                            height: 150,
                                            backgroundColor: '#9e9e9e',
                                            borderRadius: 5,
                                            margin: "10px"
                                        }}
                                    >
                                        <Typography style={{color: "#FFFFFF"}} variant="h4">
                                            Duration: {testsData.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            {
                                loadFailedTestData ?
                                <CircularProgress />
                                :
                            
                            <Box display="flex" flexDirection="column" justifyContent="center" paddingX={3} >
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
                                                    View Standard Output (stdout)
                                                </Button>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                            }
                        </> : null
                    }
                    </>
                    }
                </Box>
                <p>
                    Full JUnit XML report: <a href={`/xml/${fileName}`} target="_blank" rel="noopener noreferrer">{fileName}</a>
                </p>
            </header>
        </div>
    );
}

export default Tests;
