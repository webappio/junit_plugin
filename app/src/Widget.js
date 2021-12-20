import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import "./Widget.css"
import {Box} from "@mui/material";

export default function Widget() {
    const { jobUuid } = useParams();
    console.log(jobUuid);
    const [runnerIps, setRunnerIps] = useState([]);
    const [testsData, setTestsData] = useState({
        failures: 0,
        tests: 0,
        time: 0,
    });

    useEffect(() => {
        fetch(`/api/runners/${jobUuid}`)
            .then(response => response.json())
            .then(data => setRunnerIps(() => {
                console.log(data)
                return data;
            }))
    }, [jobUuid]);

    useEffect(() => {
        console.log("hit!!!")
        Promise.all(
            runnerIps.filter(runner => runner.Status === 'RUNNING').map(runner =>
                fetch(`/api/all-tests/${runner.running_pod_ip4}`)
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                    })
                    .then(data => setTestsData(prevState => {
                        console.log(prevState);
                        prevState.failures += data[0].failures;
                        prevState.tests += data[0].tests;
                        prevState.time += data[0].time;
                        console.log(prevState);
                        return prevState;
                    }))
                    .catch(err => console.error(err))
            )
        ).then(() => console.log('done'))
    }, [runnerIps])


    return <Box display="flex" flexDirection="column" padding="30px">
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
            <h5 className="topbar-text">JUnit Test Results</h5>
            <span className={testsData.failures > 0 ? "status-failure" : "status-success"}>
                <i className="feather icon-check-circle"/>&nbsp;{testsData.failures > 0 ? testsData.failures +" Failures" : "Success"}
            </span>
        </Box>
        <Box display="flex" className="main-container">
            {testsData.failures > 0 ?
                <div className="section failed-tests">
                    <h5>Failed</h5>
                    <hr />
                    <h3 className="status-subtext">{testsData.failures}</h3>
                </div>
                : null
            }
            {testsData.tests - testsData.failures > 0 ?
                <div className="section passed-tests">
                    <h5>Passed</h5>
                    <hr/>
                    <h3 className="status-subtext">{testsData.tests - testsData.failures}</h3>
                </div>
                : null
            }
            {testsData.time > 0 ?
                <div className="section duration">
                    <h5>Duration</h5>
                    <hr />
                    <h3 className="status-subtext">{testsData.time.toFixed(1)}s</h3>
                </div>
                : null
            }
            {testsData.tests === 0 ?
                <div className="section stopped-containers">
                    <h5>No test results found</h5>
                </div>
                : null
            }
        </Box>
    </Box>
}