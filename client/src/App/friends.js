import { useState, useEffect } from "react";

export default function SortFriendships() {
    const [friends, setFriends] = useState([]);
    const [wannabes, setWannabes] = useState([]);

    useEffect(() => {
        async function getFriendships() {
            const response = await fetch("/api/friendships");
            const data = await response.json();

            setFriends(data.filter((user) => user.is_friend));
            setWannabes(data.filter((user) => !user.is_friend));
        }
        getFriendships();
    }, []);

    function onUserClick(id, action) {
        if (action === "unfriend") {
            const newFriends = friends.filter((x) => x.id !== id);
            setFriends(newFriends);
        }
        if (action === "accept") {
            const currentWannabe = wannabes.find((x) => x.id === id);
            const newWannabes = wannabes.filter((x) => x.id !== id);
            const newFriends = [...friends, currentWannabe];
            setWannabes(newWannabes);
            setFriends(newFriends);
        }
    }
}
