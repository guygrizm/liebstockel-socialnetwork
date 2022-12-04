import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OtherProfile() {
    const [otherUser, setOtherUser] = useState({});
    const { otherUserId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function getUser() {
            const response = await fetch(`/api/users/${otherUserId}`);

            const data = await response.json();
            setOtherUser(data);

            if (!data) {
                navigate("/", { replace: true });
            }
        }
        getUser();
    }, []);
    return (
        <section className="profile">
            <img
                className="otherUser"
                src={otherUser.profile_picture_url}
                alt={`${otherUser.first_name} $otherUser.last_name}`}
            />
            <section>
                <h2>
                    {otherUser.first_name} {otherUser.last_name}
                </h2>
                <h3>Something about myself:</h3>
                <p>{otherUser.bio}</p>
            </section>
        </section>
    );
}
