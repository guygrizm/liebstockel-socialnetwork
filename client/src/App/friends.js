import { useEffect, useState } from "react";
import UserView from "./userView.js";

export default function SortFriendships() {
    const [friendships, setFriendships] = useState([]);
    console.log(friendships);
    const [wannabes, setWannabes] = useState([]);

    useEffect(() => {
        async function getFriendships() {
            const response = await fetch("/api/friendships");
            const data = await response.json();
            console.log("data from friendships", data);

            setFriendships(data.filter((user) => user.accepted));
            setWannabes(data.filter((user) => !user.accepted));
        }
        getFriendships();
    }, []);

    async function onClick(id, action) {
        if (action === "accept") {
            const response = await fetch(`/api/friendships/${id}`, {
                method: "POST",
            });
            const friendship = await response.json();
            console.log("friendship", friendship);
            console.log("this-id", id);

            //

            const currentWannabe = wannabes.find((user) => user.user_id === id);

            const newWannabes = wannabes.filter((user) => user.user_id !== id);

            const newFriends = [...friendships, currentWannabe];
            setWannabes(newWannabes);
            setFriendships(newFriends);
        }

        if (action === "unfriend") {
            const response = await fetch(`/api/friendships/${id}`, {
                method: "POST",
            });
            const friendship = await response.json();
            console.log("friendship", friendship);
            const newFriends = friendships.filter(
                (user) => user.user_id !== id
            );
            setFriendships(newFriends);
        }
    }

    return (
        <section>
            <h2>Friends</h2>
            <ul className="userView">
                {friendships.map((friendships) => (
                    <li key={friendships.user_id}>
                        <UserView
                            {...friendships}
                            onClick={onClick}
                            action="unfriend"
                        />
                    </li>
                ))}
            </ul>

            <h2>Wannabes</h2>

            <ul className="userView">
                {wannabes.map((friendships) => (
                    <li key={friendships.user_id}>
                        <UserView
                            {...friendships}
                            onClick={onClick}
                            action="accept"
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
