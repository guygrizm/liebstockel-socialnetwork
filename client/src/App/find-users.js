import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FindUsers() {
    const [users, setUsers] = useState([]);

    const [query, setQuery] = useState("");

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/find-users?q=${query}`);
            const data = await response.json();
            console.log("data", data);

            setUsers(data);
        })();
    }, [query]);

    function handleChange(event) {
        setQuery(event.target.value);
    }

    return (
        <div className="find-users">
            <h1>Find Users</h1>
            <input
                className="search-user"
                type="text"
                placeholder="search user"
                onChange={handleChange}
            />

            {!query && <h3>New Users</h3>}

            <ul className="users-list">
                {users.map((user) => (
                    <li key={user.id}>
                        <Link className="new-users" to={`/users/${user.id}`}>
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
        </div>
    );
}
