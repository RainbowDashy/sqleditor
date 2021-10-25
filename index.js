const sqlite3 = require('sqlite3');
const express = require('express');
const { open } = require('sqlite');
const path = require('path');
const compression = require('compression');
const app = express();
const port = 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.text());

async function sqlExecute(rawCode) {

  let output = [];

  // remove code annotation using regex
  const statements = ''.concat(rawCode).replace(/\/\*[\s\S]*?\*\//g, '').split(';').map(c => c.trim()).filter(c => c.length);

  const db = await open({ filename: ':memory:', driver: sqlite3.Database });

  for (const statement of statements) {
    const rows = await db.all(statement);

    if (rows.length > 0) {
      output.push(rows);
    }
  }

  db.close();
  return output;
}

app.post('/execute', async (req, res) => {
  let output;
  let success = true;
  let error = '';
  try {
    output = await sqlExecute(req.body);
  } catch (err) {
    success = false;
    error = err.message;
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.json({ success, result: output, error });
})

if (isProduction) {
  app.use(compression());
  app.use(express.static(path.join(__dirname, 'build')));
}

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
})

