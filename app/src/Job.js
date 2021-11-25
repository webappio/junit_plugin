import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {List, ListItemButton, ListItemText, Typography, CircularProgress, Button } from "@mui/material";
import Box from "@mui/material/Box";
import { blue } from "./styles";

const textStyle = {
    fontWeight: "600",
}

function Job() {
    const [sshOutput, setSshOutput] = useState([]);
    const [loading, setLoading] = useState(true);
    let { jobUuid } = useParams();

    useEffect(() =>{
        fetch(`/api/ssh/${jobUuid}`)
            .then(response => response.json())
            .then(data => {
                setSshOutput(data);
                setLoading(false);
            })
    }, [jobUuid])

    return (
        <div className="Default">
            <header className="App-header">
                <Box sx={{ width: '100%', maxWidth: 720, bgcolor: 'background.paper' }}>
                    <Typography sx={{ mt: 4, mb: 2 }} variant="h5" component="div" style={textStyle}>
                        All JUnit XML Files for Job: 
                        <br />
                        {jobUuid}
                    </Typography>
                    {
                        loading ?
                        <CircularProgress />
                        :
                        <List>
                            {
                                sshOutput.map(file => (
                                    <Box
                                    key={file.name}
                                    margin={2}
                                    display="flex"
                                    flexDirection="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    padding={3}
                                    sx={{
                                        border: 1,
                                        borderLeft: 10,
                                        borderColor: blue
                                    }}
                                    >
                                        <Box display="flex" style={{ textAlign: "left" }}>
                                            <Typography>
                                                {file.name}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" width="25%" justifyContent="right">
                                            <Button
                                                variant="outlined"
                                                style={{
                                                    color: blue,
                                                    borderColor: blue,
                                                    textTransform: "none"
                                                }}
                                                href={`/tests/${jobUuid}/${file.name}`}
                                            >
                                                View Tests
                                            </Button>
                                        </Box>
                                    </Box>
                                ))
                            }
                        </List>
                    }
                </Box>
            </header>
        </div>
    );
}

export default Job;
