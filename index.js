const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("endpoint testing");
});

app.listen(3000, () => {
    console.log(`Server started on port`);
});