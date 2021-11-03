import logo from './logo.svg';
import './App.css';
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xml: '',
      xsl: ''
    };
  }

  componentDidMount() {
    fetch('http://127.0.0.1:3000/xml')
        .then(response => response.text())
        .then(data => this.setState({
          xml: data
        }))
  }

  render() {
    let xmlFiles = this.state.xml.split('\n');
    console.log(xmlFiles)

    return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            {xmlFiles.map(file =>
                <a
                    className="App-link"
                    href={"http://127.0.0.1:3000/xml/"+file}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  {file}
                </a>
            )}
          </header>
        </div>
    );
  }
}

export default App;
