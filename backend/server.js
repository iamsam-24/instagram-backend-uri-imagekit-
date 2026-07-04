require("dotenv").config();


const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);


const app = require("./src/app");
const accDB = require("./src/ds/ds");


accDB();


app.listen(3000, () => {
    console.log("working");

})