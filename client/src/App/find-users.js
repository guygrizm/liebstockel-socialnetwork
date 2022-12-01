import { useState, useEffect } from "react";

export default function FindUsers() {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [noResult, setNoResult] = useState(false);

    useEffect(() => {
        (async () => {
            const response = await fetch(`/api/find-users?q=${query}`);
            const data = await response.json();

            setUsers(data.results);
        })();
    }, [query]);

    function handleChange(event) {
        setQuery(event.target.value);
    }

    return (
        <div className="find-users">
            <h2>Find Users</h2>
            <input type="text" placeholder="search" onChange={handleChange} />
            {users.map((user) => (
                <div key={user.url}>{user.name}</div>
            ))}
        </div>
    );
}
