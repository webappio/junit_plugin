import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import "./Widget.css"
import {Box} from "@mui/material";

export default function Widget() {
    const { fileName } = useParams();
    const [testCounts, setTestCounts] = useState({})

    useEffect(() => {
        fetch(`/api/tests/${fileName}`)
            .then(response => response.json())
            .then(data => setTestCounts(data))
            .catch(e => console.error(e));
    }, [fileName]);

    const passed = testCounts ? testCounts.testCount - testCounts.failedCount : 0;
    const failures = testCounts ? testCounts.failedCount : 0;

    const status = <span className={failures > 0 ? "status-failure" : "status-success"}>
        <i className="feather icon-check-circle"/>&nbsp;{failures > 0 ? failures +" Failures" : "Success"}
    </span>

    const sections = [];
    if(failures > 0) {
        sections.push(<div className="section failed-tests">
            <h5>Failed</h5>
            <hr />
            <h3 className="status-subtext">{failures}</h3>
        </div>)
    }
    if(passed > 0) {
        sections.push(<div className="section passed-tests">
            <h5>Passed</h5>
            <hr />
            <h3 className="status-subtext">{passed}</h3>
        </div>)
    }

    if(sections.length === 0) {
        sections.push(<div className="section stopped-containers">
            <h5>No test results found</h5>
        </div>)
    }

    return <Box display="flex" flexDirection="column" padding="30px">
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
            <h5 className="topbar-text">Cypress Test Results</h5>
            {status}
        </Box>
        <Box display="flex" className="main-container">
            {sections}
        </Box>
    </Box>
}