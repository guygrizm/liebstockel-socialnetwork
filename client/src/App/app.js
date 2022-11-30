import { useState, useEffect } from "react";
import Modal from "./modal";
import ProfilePicture from "./profilePicture";
import Profile from "./profile";

export default function App() {
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        async function getUser() {
            const response = await fetch("/api/users/me");
            const parsedJSON = await response.json();
            setUser(parsedJSON);
            console.log("user in app", user);
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
        <div className="app">
            <header>
                <p>Home</p>
                <ProfilePicture user={user} onClick={onModalOpen} />
            </header>
            {showModal && (
                <Modal updatePic={updatePic} onClick={onModalClose} />
            )}
            {
                <Profile
                    first_name={user.first_name}
                    last_name={user.last_name}
                    profile_picture_url={user.profile_picture_url}
                    bio={user.bio}
                    onBioUpdate={onBioUpdate}
                ></Profile>
            }
        </div>
    );
}
