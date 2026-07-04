const mongoose = require("mongoose");


async function accDB() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("connected to DB");

}


module.exports = accDB