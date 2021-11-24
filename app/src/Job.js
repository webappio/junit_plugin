import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {List, ListItemButton, ListItemText, Typography} from "@mui/material";
import Box from "@mui/material/Box";

function Job() {
    const [xmlFiles, setXmlFiles] = useState([]);
    const [sshOutput, setSshOutput] = useState('');
    let { jobUuid } = useParams();

    useEffect(() =>{
        fetch('/api/xml')
            .then(response => response.json())
            .then(data => setXmlFiles(data))
        fetch(`/api/ssh/${jobUuid}`)
            .then(response => response.text())
            .then(data => setSshOutput(data))
        console.log(sshOutput)
    })

    return (
        <div className="Default">
            <header className="App-header">
                <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                        All JUnit XML files for job {jobUuid}
                    </Typography>
                    <List>
                        {xmlFiles.map(fileName =>
                            <ListItemButton component="a" href={"/failed-tests/"+fileName}>
                                <ListItemText primary={fileName} />
                            </ListItemButton>
                        )}
                    </List>
                </Box>
            </header>
        </div>
    );
}

export default Job;
