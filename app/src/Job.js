import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Typography, CircularProgress, Button } from "@mui/material";
import Box from "@mui/material/Box";

function Job() {
    const [sshOutput, setSshOutput] = useState([]);
    const [loadSshOutput, setLoadSshOutput] = useState(true);
    let { jobUuid } = useParams();

    useEffect(() =>{
        fetch(`/api/ssh/${jobUuid}`)
            .then(response => response.json())
            .then(data => {
                setSshOutput(data);
                setLoadSshOutput(false);
            })
    }, [jobUuid])

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
                        loadSshOutput ?
                        <CircularProgress />
                            :
                        sshOutput.map(file =>
                            <a href={`/${jobUuid}/tests/${file.name}`} style={{ textDecoration: "none" }}>
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
                                        {file.name}
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
                                        href={`/${jobUuid}/tests/${file.name}`}
                                    >
                                        View Tests
                                    </Button>
                                </Box>
                            </Box>
                            </a>
                        )
                    }
                </Box>
            </header>
        </div>
    );
}

export default Job;
