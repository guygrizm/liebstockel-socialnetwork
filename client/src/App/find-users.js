import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FindUsers() {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/find-users?q=${query}`);
            const data = await response.json();

            setUsers(data);
        })();
    }, [query]);

    function handleChange(event) {
        setQuery(event.target.value);
    }

    return (
        <>
            <h1>Find Users</h1>
            <input
                type="text"
                placeholder="search user"
                onChange={handleChange}
            />

            {!query && <h3>New Users</h3>}

            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <Link to={`/users/${user.id}`}>
                            <img
                                className="users-picture "
                                src={user.profile_picture_url}
                                alt={`${user.first_name} ${user.last_name}`}
                            />
                            {user.first_name} {user.last_name}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
