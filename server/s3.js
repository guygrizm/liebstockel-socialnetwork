// s3upload.js
const { S3 } = require("aws-sdk");
const fs = require("fs");

const { AWS_KEY, AWS_SECRET, AWS_BUCKET } = process.env;

const s3 = new S3({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
});

const Bucket = AWS_BUCKET;

function s3upload(request, response, next) {
    if (!request.file) {
        console.log("[imageboard:s3] file not there");
        response.sendStatus(400);
        return;
    }
    const {
        filename: Key,
        mimetype: ContentType,
        size: ContentLength,
        path,
    } = request.file;

    console.log("[imageboard:s3] uploading to s3...", {
        Bucket,
        Key,
        ContentType,
        ContentLength,
    });

    s3.putObject({
        Bucket,
        ACL: "public-read",
        Key,
        Body: fs.createReadStream(path),
        ContentType,
        ContentLength,
    })
        .promise()
        .then(() => {
            console.log("[imageboard:s3] uploaded to s3");
            next();
            // delete original file on upload
            fs.unlink(path, () => {});
        })
        .catch((error) => {
            console.log("[imageboard:s3] error uploading to s3", error);
            response.sendStatus(500);
        });
}

module.exports = s3upload;
