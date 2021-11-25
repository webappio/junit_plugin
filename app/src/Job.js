import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {List, ListItemButton, ListItemText, Typography} from "@mui/material";
import Box from "@mui/material/Box";

function Job() {
    const [sshOutput, setSshOutput] = useState([]);
    let { jobUuid } = useParams();

    useEffect(() =>{
        fetch(`/api/ssh/${jobUuid}`)
            .then(response => response.json())
            .then(data => setSshOutput(data))
    }, [jobUuid])

    return (
        <div className="Default">
            <header className="App-header">
                <Box sx={{ width: '100%', maxWidth: 720, bgcolor: 'background.paper' }}>
                    <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                        All JUnit XML files for job {jobUuid}
                    </Typography>
                    <List>
                        {sshOutput.map(file =>
                            <ListItemButton component="a" href={"/tests/"+file.name}>
                                <ListItemText primary={file.name} />
                            </ListItemButton>
                        )}
                    </List>
                </Box>
            </header>
        </div>
    );
}

export default Job;
