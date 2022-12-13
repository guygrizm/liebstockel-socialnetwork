const express = require("express");
const app = express();
const server = require("http").Server(app);
const socketConnect = require("socket.io");
const io = socketConnect(server, {
    allowRequest: (request, callback) =>
        callback(
            null,
            request.headers.referer.startsWith(`http://localhost:3000`)
        ),
});
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
    findUsers,
    getFriendship,
    requestFriendship,
    acceptFriendship,
    deleteFriendship,
    getFriendships,
    getMessages,
    createMessages,
    deleteFrinedship,
    deleteUser,
    deleteChat,
} = require("../db");

const cookieSessionMiddleware = cookieSession({
    secret: SESSION_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14,
});
app.use(cookieSessionMiddleware);
io.use((socket, next) => {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

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

app.get("/api/find-users", async (req, res) => {
    try {
        const users = await findUsers(req.query.q);
        const { user_id } = req.session;
        console.log("user_id", user_id);
        const newUsers = users.filter((user) => user.id !== user_id);
        console.log("newUsers", newUsers);

        res.json(newUsers);
    } catch (error) {
        console.log(error);
        res.json(null);
    }
});

// other users

app.get("/api/users/:otherUserId", async (req, res) => {
    const { otherUserId } = req.params;
    const { user_id } = req.session;
    const otherUser = await getUserById(otherUserId);
    if (otherUserId == user_id || !otherUser) {
        res.json(null);
        return;
    } else {
        res.json(otherUser);
    }
});

// friendship functions

function getFriendshipStatus(response, user_id) {
    if (!response) {
        return "NO_FRIENDSHIP";
    }
    if (!response.accepted && response.sender_id === user_id) {
        return "OUTGOING_FRIENDSHIP";
    }
    if (!response.accepted && response.recipient_id === user_id) {
        return "INCOMING_FRIENDSHIP";
    }
    if (response.accepted) {
        return "ACCEPTED_FRIENDSHIP";
    }
}

app.get("/api/friendships/:user_id", async (req, res) => {
    const loggedUserId = req.session.user_id;
    const otherUserId = req.params.user_id;

    const friendship = await getFriendship({
        first_id: loggedUserId,
        second_id: otherUserId,
    });
    console.log("friendship", friendship);
    const status = await getFriendshipStatus(friendship, loggedUserId);
    res.json({ ...friendship, status });
});

app.post("/api/friendships/:user_id", async (req, res) => {
    const loggedUserId = req.session.user_id;
    const otherUserId = req.params.user_id;

    const friendship = await getFriendship({
        first_id: loggedUserId,
        second_id: otherUserId,
    });

    const currentStatus = getFriendshipStatus(friendship, loggedUserId);
    let status;
    console.log("currentStatus", currentStatus);
    if (currentStatus === "NO_FRIENDSHIP") {
        await requestFriendship({
            sender_id: loggedUserId,
            recipient_id: otherUserId,
        });
        status = "OUTGOING_FRIENDSHIP";
    }

    if (currentStatus === "INCOMING_FRIENDSHIP") {
        await acceptFriendship({
            sender_id: otherUserId,
            recipient_id: loggedUserId,
        });
        status = "ACCEPTED_FRIENDSHIP";
    }

    if (
        currentStatus === "ACCEPTED_FRIENDSHIP" ||
        currentStatus === "OUTGOING_FRIENDSHIP"
    ) {
        await deleteFriendship({
            first_id: loggedUserId,
            second_id: otherUserId,
        });
        status = "NO_FRIENDSHIP";
    }
    res.json({ status });
});

// get friendships

app.get("/api/friendships", async (req, res) => {
    const friendships = await getFriendships(req.session.user_id);
    console.log("friendships", friendships);
    res.json(
        friendships.map((friendship) => ({
            ...friendship,
            status: getFriendshipStatus(friendship, req.session.user_id),
        }))
    );
});

// delete user

app.post("/api/delete", async (req, res) => {
    try {
        const { user_id } = req.session;

        await deleteUser(user_id);

        req.session = null;
        res.json("ok");
    } catch (error) {
        console.log("error delete", error);
    }
});

// logout

app.get("/logout", (req, res) => {
    (req.session = null), res.redirect("/");
});

/////// write only above these functions
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

io.on("connection", async (socket) => {
    console.log("[social:socket] incoming socked connection", socket.id);
    console.log("session", socket.request.session);
    const { user_id } = socket.request.session;
    if (!user_id) {
        return socket.disconnect(true);
    }
    const chatMessages = await getMessages();

    socket.emit("chat", chatMessages);

    socket.on("newMessage", async function ({ message }) {
        const sender_id = user_id;
        const chatData = await createMessages({ sender_id, message });
        const { first_name, last_name, profile_picture_url } =
            await getUserById(sender_id);
        const newChatData = {
            ...chatData,
            first_name,
            last_name,
            profile_picture_url,
            sender_id,
            message,
        };

        io.emit("newMessage", newChatData);
    });
});

server.listen(PORT, function () {
    console.log(`Express server listening on port ${PORT}`);
});
