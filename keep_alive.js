const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'templates'));

app.get('/', (req, res) => {
    res.render('useless');
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`Monitor server started at ${port}`);
});