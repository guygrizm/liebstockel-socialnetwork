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

module.exports = {
    createUser,
    login,
    getUserById,
    updateProfilePicture,
};
