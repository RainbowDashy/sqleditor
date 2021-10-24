import './App.css';
import AceEditor from 'react-ace';
import { useState } from 'react';
import defaultValue from './DefaultValue';

const server = process.env.SERVER ?? "http://localhost:3001/execute";

function Table({ rows }) {
  const headers = Object.keys(rows[0]);
  return (
    <table>

      <thead>
        <tr>
          {headers.map(header => <th key={header}>{header}</th>)}
        </tr>
      </thead>

      <tbody>
        {rows.map(
          (row, idx) =>
            <tr key={idx}>
              {Object.values(row).map(val => <td key={val}>{val}</td>)}
            </tr>
        )}
      </tbody>
    </table>
  )
}


function App() {
  const [code, setCode] = useState(defaultValue);
  const [result, setResult] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCode(e);
  }

  const handleExecute = () => {
    fetch(server, {
      body: code,
      method: 'POST',
      mode: "cors",
    })
      .then(res => res.json())
      .then((res) => {
        console.log(res);
        if (res.success)
          setResult(res.result);
        else
          setError(res.error);
        setSuccess(res.success);
      })
  }

  return (
    <div className="App">
      <h2>
        Execute SQL online (sqlite v3.27.2)
      </h2>
      <AceEditor
        mode="sql"
        theme="github"
        name="editor"
        fontSize={16}
        width='1400px'
        height='600px'
        onChange={(e) => handleChange(e)}
        value={code}
        showPrintMargin={false}
      />
      <div className="panel">
        <button onClick={() => handleExecute()}>Execute</button>
      </div>
      <div className="result">
        {success ? result.map((rows, idx) => <Table key={idx} rows={rows} />) : error}
      </div>
    </div>
  );
}

export default App;
