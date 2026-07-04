const express = require("express");
const multer = require("multer");
const uploadFile = require("./services/storage.service");
const postModel = require("./models/post.model")
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({
    storage: multer.memoryStorage()
})

app.use(express.json());

///creating the api 

app.post("/create-post", upload.single("image"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    if (!req.file) {
        return res.status(400).json({
            message: "Upload Image"
        })
    }


    const result = await uploadFile(req.file.buffer);
    console.log(postModel);
    const post = await postModel.create({
        image: result.url,
        caption: req.body.caption
    })


    res.status(201).json({
        message: "Post Created",
        post
    });



})

app.get("/posts", async (req, res) => {
    const posts = await postModel.find()

    return res.status(200).json({
        message: "Post found",
        posts
    })
})


module.exports = app