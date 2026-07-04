const { ImageKit } = require("@imagekit/nodejs");
const { File } = require("node:buffer");

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function uploadFile(buffer, originalName = "img-.png") {
    console.log(buffer);
    const file = new File([buffer], originalName, { type: "image/png" });
    const result = await imagekit.files.upload({
        file,
        fileName: originalName
    });
    return result;
}

module.exports = uploadFile;