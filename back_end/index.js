const express = require("express");
require("dotenv").config();
const database = require("./config/database");
// const routeApiClient = require("./routes/client/index.route");
// const routeApiAdmin = require("./routes/admin/index.route");
const bodyParser = require('body-parser');
const cors = require('cors');
database.connect();
const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.json())
// routeApiClient(app);
// routeApiAdmin(app)
app.listen(port,()=>{
    console.log(`Server đang chạy trên cổng ${port}`);
})