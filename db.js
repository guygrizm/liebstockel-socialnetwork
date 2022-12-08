require("dotenv").config();
const spicedPg = require("spiced-pg");
const { hash, genSalt, compare } = require("bcryptjs");
const { DATABASE_USERNAME, DATABASE_PASSWORD } = process.env;

const DATABASE_NAME = "social-network";

const db = spicedPg(
    `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`
);
async function hashPassword(password) {
    const salt = await genSalt();
    return hash(password, salt);
}
// createUser
async function createUser({ first_name, last_name, email, password }) {
    const hashedPassword = await hashPassword(password);

    const result = await db.query(
        `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [first_name, last_name, email, hashedPassword]
    );
    return result.rows[0];
}

// get user by email
async function getUserByEmail(email) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
        email,
    ]);
    return result.rows[0];
}

// login
async function login({ email, password }) {
    const foundUser = await getUserByEmail(email);

    if (!foundUser) {
        return null;
    }
    const match = await compare(password, foundUser.password_hash);

    if (!match) {
        return null;
    }
    return foundUser;
}
async function getUserById(id) {
    const result = await db.query(
        `
    SELECT * FROM users WHERE id = $1
    `,
        [id]
    );
    return result.rows[0];
}

// new profile picture
async function updateProfilePicture({ profile_picture_url, id }) {
    const result = await db.query(
        `
    UPDATE users SET profile_picture_url= $1 WHERE id = $2
    RETURNING *
    `,
        [profile_picture_url, id]
    );
    return result.rows[0];
}

// new bio
async function updateBio({ bio, id }) {
    const result = await db.query(
        `
    UPDATE users
    SET bio = $1
    WHERE id = $2
    RETURNING bio
    `,
        [bio, id]
    );
    return result.rows[0];
}
// find users

async function findUsers(q) {
    if (!q) {
        const result = await db.query(`
        SELECT * FROM users ORDER BY id DESC LIMIT 3`);
        return result.rows;
    }
    const result = await db.query(
        `
    SELECT * FROM users WHERE first_name ILIKE $1 LIMIT 3`,
        [q + "%"]
    );
    return result.rows;
}

// friendships functions

async function getFriendship({ first_id, second_id }) {
    const result = await db.query(
        `
    SELECT sender_id, recipient_id, accepted FROM friendships
    WHERE sender_id = $1 AND recipient_id = $2
    OR  sender_id = $2 AND recipient_id = $1`,
        [first_id, second_id]
    );
    return result.rows[0];
}

async function requestFriendship({ sender_id, recipient_id }) {
    const result = await db.query(
        `
    INSERT INTO friendships (sender_id, recipient_id)
    VALUES ($1,$2)
    RETURNING *`,
        [sender_id, recipient_id]
    );
    return result.rows[0];
}

async function acceptFriendship({ sender_id, recipient_id }) {
    const result = await db.query(
        `
    UPDATE friendships 
    SET accepted = true
    WHERE sender_id = $1 
    AND recipient_id = $2
    RETURNING *`,
        [sender_id, recipient_id]
    );
    return result.rows[0];
}

async function deleteFriendship({ first_id, second_id }) {
    const result = await db.query(
        `
    DELETE FROM friendships
    WHERE sender_id = $1 AND recipient_id = $2
    OR  sender_id = $2 AND recipient_id = $1
    `,
        [first_id, second_id]
    );
    return result.rows[0];
}

//friendships list

async function getFriendships(user_id) {
    const results = await db.query(
        `SELECT friendships.accepted,
        friendships.sender_id,
        friendships.recipient_id,
        users.id AS user_id,
        users.first_name, users.last_name, users.profile_picture_url
        FROM friendships JOIN users
        ON (users.id = friendships.sender_id AND friendships.recipient_id = $1)
        OR (users.id = friendships.recipient_id AND friendships.sender_id = $1 AND accepted = true)`,
        [user_id]
    );
    return results.rows;
}

module.exports = {
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
};
