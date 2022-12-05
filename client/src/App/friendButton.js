import { useEffect, useState } from "react";

function getButtonLabel(status) {
    if (status === "NO_FRIENDSHIP") {
        return "Send friend request";
    }
    if (status === "OUTGOING_FRIENDSHIP") {
        return "Request pending";
    }
    if (status === "INCOMING_FRIENDSHIP") {
        return "Friend request ";
    }
    if (status === "ACCEPTED_FRIENDSHIP") {
        return "Delete friend";
    }
    return "...";
}

export default function FriendShipButton({ user_id }) {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        async function getFriendship() {
            const response = await fetch(`/api/friendships/${user_id}`);
            const friendship = await response.json();

            setStatus(friendship.status);
        }
        getFriendship();
    }, [user_id]);

    async function onClick(event) {
        event.preventDefault();
        console.log("FriendShipButton:onClick", status);
        const response = await fetch(`/api/friendships/${user_id}`, {
            method: "POST",
        });
        const friendship = await response.json();
        setStatus(friendship.status);
    }

    return (
        <>
            <button
                className="friendButton"
                onClick={onClick}
                disabled={status === "OUTGOING_FRIENDSHIP"}
            >
                {getButtonLabel(status)}
            </button>
        </>
    );
}
