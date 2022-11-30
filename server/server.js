const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
require("dotenv").config();
const { PORT = 3001, SESSION_SECRET } = process.env;
const cookieSession = require("cookie-session");
const multer = require("multer");
const uidSafe = require("uid-safe");

const {
    createUser,
    login,
    getUserById,
    updateProfilePicture,
    updateBio,
} = require("../db");

app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "public")));

const { AWS_BUCKET } = process.env;

const s3upload = require("./s3");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, "uploads"));
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

// uploader

app.post(
    "/api/users/profilePicture",
    uploader.single("image"),
    s3upload,
    async (req, res) => {
        console.log("req.body: ", req.body);

        const profile_picture_url = `https://s3.amazonaws.com/${AWS_BUCKET}/${req.file.filename}`;
        const updatedUser = await updateProfilePicture({
            profile_picture_url,
            id: req.session.user_id,
        });

        res.json(updatedUser);
    }
);

app.get("/api/users/me", async (req, res) => {
    if (!req.session.user_id) {
        res.json(null);
        return;
    }

    const loggedUser = await getUserById(req.session.user_id);

    res.json({
        id: loggedUser.id,
        first_name: loggedUser.first_name,
        last_name: loggedUser.last_name,
        profile_picture_url: loggedUser.profile_picture_url,
        bio: loggedUser.bio,
    });
});

app.post("/api/users", async (req, res) => {
    console.log("req.body", req.body);
    try {
        const newUser = await createUser(req.body);
        req.session.user_id = newUser.id;
        res.json({ success: true });
    } catch (error) {
        console.log("POST users", error);
        res.status(500).json({ error: "Something has gone wrong" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const user = await login(req.body);
        if (!user) {
            res.status(401).json({
                error: "The email or password you entered are not correct",
            });
            return;
        }
        req.session.user_id = user.id;
        res.json({ success: true });
    } catch (error) {
        console.log("POST login", error);
        res.status(500).json({ error: "Something has gone wrong" });
    }
});
app.post("/api/users/bio", async (req, res) => {
    try {
        const id = req.session.user_id;
        const bio = req.body.bio;
        const newBio = await updateBio({ bio, id });
        res.json(newBio);
        console.log("new Bio", newBio);
    } catch (error) {
        console.log("Error users/bio", error);
    }
});

/////// write only above these functions
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.listen(PORT, function () {
    console.log(`Express server listening on port ${PORT}`);
});
