import { useState, useEffect } from "react";
import Modal from "./modal";
import ProfileImage from "./profileImage";

export default function App() {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function getUser() {
            const response = await fetch("/api/users/me");
            const parsedJSON = await response.json();
            setUser(parsedJSON);
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

    function updateImg(url) {
        setUser({ ...user, url });
        setShowModal(false);
    }

    if (!user) {
        return <h2>Loading</h2>;
    }

    return (
        <div className="app">
            <header>
                <p>Home</p>
                <ProfileImage user={user} onClick={onModalOpen} />
            </header>
            {showModal && (
                <Modal updateImg={updateImg} onClick={onModalClose} />
            )}
        </div>
    );
}
