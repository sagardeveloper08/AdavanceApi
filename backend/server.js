const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const productrouter = require('./routes/product')
const auth = require('./routes/users')
const order = require('./routes/order')

require('./models/config/config')
require("dotenv").config();

app.use(cookieParser());
app.use(express.json())

// 
app.use('/api', productrouter)
app.use('/api', auth);
app.use('/api', order)
// schemaName.index({ request: 'text' });
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})