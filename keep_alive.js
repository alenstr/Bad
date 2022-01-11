const express = require('express');
const app = express();
const port = 2323;
app.get('/', (req, res) => res.send('MatiMajka Je ziva!'));

app.listen(port, () => console.log(`MatiMajka Poslusa TheCRIB#7361-a na discordu`));