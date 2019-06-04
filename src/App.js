import React from 'react';
import logo from './wce_logo.svg';
import './App.css';
// import ReactDOM from 'react-dom';
import Commands from './components/Commands';
import './commands.less';
import './bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <table>
          <tbody>
            <tr>
              <td>
                <img src={logo} className="App-logo" alt="logo" />
              </td>
              <td>
                <a
                    className="App-link"
                    href="https://www.worldcomputerexchange.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
            World Computer Exchange
                </a>
             </td>
            </tr>
          </tbody>
        </table>
      </header>
      <Commands />
    </div>
  );
}

export default App;
