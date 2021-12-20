import './App.css';
import React, {useEffect, useState} from "react";
import {useNavigate, useLocation, useParams} from "react-router-dom";
import {Typography, CircularProgress, Button } from "@mui/material";
import Box from "@mui/material/Box";

function Runner() {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    let {runnerIp} = useParams();
    let navigate = useNavigate();
    function useQuery() {
        const { search } = useLocation();

        return React.useMemo(() => new URLSearchParams(search), [search]);
    }
    let query = useQuery();

    useEffect(() => {
        fetch(`/api/ssh/${runnerIp}`)
            .then(response => {
                if (response.ok) {
                    setLoading(false);
                }
                return response.json()
            })
            .then(data => {
                setFiles(data);
            })
    }, [runnerIp])

    let sections = [];
    if (files) {
        files.forEach(file => {
                sections.push(
                    <a href={`/${runnerIp}/tests/${file.name}`} style={{textDecoration: "none"}}>
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
                                    href={`/tests/${runnerIp}/${file.name}`}
                                >
                                    View Files
                                </Button>
                            </Box>
                        </Box>
                    </a>)
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
                        No JUnit XML report found! Check /webappio/junitXML directory (abosolute path).
                    </Typography>
                </Box>
            </Box>)
    }

    return (
        <div className="Default">
            <header className="App-header">
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Box display="flex" justifyContent="center">
                        <Box display="flex" style={{ width: "960px", maxWidth: "100%" }}>
                            <Button variant="outlined" size="large" style={{ marginLeft: "10px" }} onClick={() => navigate(-1)}> Back </Button>
                        </Box>
                    </Box>
                    <Typography sx={{ mt: 4, mb: 2 }} style={{ fontWeight: 600 }} variant="h4" component="div">
                        All JUnit XML Files from:
                        <br />
                        {query.get("layerfile")}
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

export default Runner;
