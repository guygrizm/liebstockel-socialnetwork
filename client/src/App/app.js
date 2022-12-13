import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Modal from "./modal";
import ProfilePicture from "./profilePicture";
import Profile from "./profile";
import FindUsers from "./find-users";
import OtherProfile from "./otherProfile";
import SortFriendships from "./friends";
import Chat from "./chat";

export default function App() {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        async function getUser() {
            const response = await fetch("/api/users/me");
            const parsedJSON = await response.json();
            setUser(parsedJSON);
            console.log("user in app", parsedJSON);
        }
        getUser();
    }, []);

    // event listeners
    function onModalOpen() {
        setShowModal(true);
    }

    function onModalClose() {
        setShowModal(false);
    }

    function updatePic(profile_picture_url) {
        setUser({ ...user, profile_picture_url });
        setShowModal(false);
    }

    function onBioUpdate(bio) {
        setUser({ ...user, bio });
        console.log("bio-update", bio);
    }

    if (!user) {
        return <h2>Loading</h2>;
    }

    return (
        <BrowserRouter>
            <header>
                <Link to="/">
                    <img className="app-logo" src="/logo.png" alt="logo" />
                </Link>
                <nav className="menu">
                    <Link to="/">Home</Link>
                    <Link to="/users">Find Users</Link>
                    <Link to="/chat">Chat Room</Link>
                    <Link to="/friends">Friends</Link>
                    <a href="/logout">Logout</a>
                    <ProfilePicture {...user} onClick={onModalOpen} />
                    {showModal && (
                        <Modal updatePic={updatePic} onClick={onModalClose} />
                    )}
                </nav>
            </header>
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Profile
                                first_name={user.first_name}
                                last_name={user.last_name}
                                profile_picture_url={user.profile_picture_url}
                                bio={user.bio}
                                onBioUpdate={onBioUpdate}
                            />
                        </>
                    }
                />
                <Route path="/users" element={<FindUsers />} />
                <Route path="/users/:otherUserId" element={<OtherProfile />} />
                <Route path="/friends" element={<SortFriendships />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
        </BrowserRouter>
    );
}
