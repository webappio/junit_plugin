import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Typography, CircularProgress, Button } from "@mui/material";
import Box from "@mui/material/Box";

function Job() {
    const [loading, setLoading] = useState(true);
    const [runners, setRunners] = useState([]);
    let {jobUuid} = useParams();

    useEffect(() => {
        fetch(`/api/runners/${jobUuid}`)
            .then(response => response.json())
            .then(data => {
                setRunners(data);
                setLoading(false);
            })
    }, [jobUuid])

    let sections = [];
    if (!runners.error) {
        runners.forEach(runner => {
                if (runner.running_pod_ip4) {
                    sections.push(
                        <a href={`/runner/${runner.running_pod_ip4}?layerfile=${runner.layerfile_path}`} style={{textDecoration: "none"}}>
                            <Box
                                margin={2}
                                display="flex"
                                flexDirection="row"
                                justifyContent="space-between"
                                alignItems="center"
                                padding={3}
                                sx={{
                                    border: 1,
                                    borderLeft: 10,
                                    borderColor: '#1038c7'
                                }}
                            >
                                <Box display="flex" width="25%">
                                    <Typography>
                                        {runner.layerfile_path}
                                    </Typography>
                                </Box>
                                <Box display="flex" width="25%" justifyContent="right">
                                    <Button
                                        variant="outlined"
                                        style={{
                                            color: '#1038c7',
                                            borderColor: '#1038c7',
                                            textTransform: "none"
                                        }}
                                        href={`/runner/${runner.running_pod_ip4}?layerfile=${runner.layerfile_path}`}
                                    >
                                        View Files
                                    </Button>
                                </Box>
                            </Box>
                        </a>)
                }
            }
        );
    }
    if (sections.length === 0) {
        sections.push(
            <Box
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
                <Box display="flex" width="100%">
                    <Typography>
                        No running pods for job {jobUuid} found!
                    </Typography>
                </Box>
            </Box>)
    }

    return (
        <div className="Default">
            <header className="App-header">
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Typography sx={{ mt: 4, mb: 2 }} style={{ fontWeight: 600 }} variant="h4" component="div">
                        All JUnit XML Files for Job: 
                        <br />
                        {jobUuid}
                    </Typography>
                        {
                        loading ?
                        <CircularProgress />
                            :
                            sections
                    }
                </Box>
            </header>
        </div>
    );
}

export default Job;
