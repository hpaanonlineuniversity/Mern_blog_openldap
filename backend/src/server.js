//server.js

import express from 'express';


const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World123');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});