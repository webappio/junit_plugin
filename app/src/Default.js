import './App.css';
import React, {useEffect, useState} from "react";

function Default() {
    const [xmlFiles, setXmlFiles] = useState([]);

    useEffect(() =>{
        fetch('/api/xml')
            .then(response => response.json())
            .then(data => setXmlFiles(data))
    })

    return (
        <div className="Default">
            <header className="App-header">
                <p>
                    Example JUnit XML report:
                </p>
                {xmlFiles.map(fileName =>
                    <a
                        className="App-link"
                        href={"/xml/"+fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {fileName}
                    </a>
                )}
            </header>
        </div>
    );
}

export default Default;
