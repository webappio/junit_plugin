import './App.css';
import React, {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import Box from '@mui/material/Box';
import {Button, CircularProgress, Typography } from "@mui/material";
import { blue } from "./styles";

function Tests() {
    const [failedTestData, setFailedTestData] = useState([]);
    const [testCounts, setTestCounts] = useState({})
    const [loadTestCounts, setLoadTestCounts] = useState(true);
    const [loadFailedTestData, setLoadFailedTestData] = useState(true);
    let { fileName, jobUuid } = useParams();

    useEffect(() => {
        getTestCount();
        getFailedTestData();
    }, [fileName])

    const getTestCount = async () => {
        await fetch(`/api/tests/${fileName}`)
        .then(response => response.json())
        .then(data => {
            setTestCounts(data);
            setLoadTestCounts(false);
        })
    }

    const getFailedTestData = async () => {
        await fetch(`/api/failed-tests/${fileName}`)
        .then(response => response.json())
        .then(data => {
            setFailedTestData(data);
            setLoadFailedTestData(false);
        })
    }

    return (
        <div className="Tests">
            <header className="App-header">
                <Box margin={3}>
                    <div style={{ textAlign: "left", marginLeft: "30px" }}>
                        <Button
                            type="primary"
                            variant="outlined"
                            size="large"
                            href={`/${jobUuid}`}
                            style={{
                                color: blue,
                                borderColor: blue,
                                textTransform: "none"
                            }}
                        >
                            Back
                        </Button>
                    </div>
                    {
                        testCounts && (!loadTestCounts || !loadFailedTestData) ? <>
                            <Box margin={3}>
                            {
                                loadTestCounts ?
                                <CircularProgress />
                                :
                                <>
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
                                            Passed: {testCounts.testCount - testCounts.failedCount ? testCounts.testCount - testCounts.failedCount : 0}
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
                                            Failures: {testCounts.failedCount ? testCounts.failedCount : 0}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" width="30vw"/>
                                </>
                            }

                            </Box>
                            {
                                loadFailedTestData ?
                                <CircularProgress />
                                :
                                <>
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
                                    </>
                                }
                        </> 
                        : 
                        <CircularProgress />
                    }
                </Box>
                <Typography variant="h4">
                    Full JUnit XML report: <a href={`/xml/${fileName}`}>{fileName}</a>
                </Typography>
            </header>
        </div>
    );
}

export default Tests;
