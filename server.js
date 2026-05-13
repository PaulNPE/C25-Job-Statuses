const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simpro-dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`SimPro Dashboard running on port ${PORT}`);
});
