import { Link } from "react-router-dom";

export default function UserView({
    profile_picture_url,
    first_name,
    last_name,
    user_id,
    onClick,
    action,
}) {
    return (
        <>
            <Link to={`/users/${user_id}`}>
                <img
                    className="circle"
                    src={profile_picture_url}
                    alt={`${first_name} ${last_name}`}
                />
            </Link>
            {first_name} {last_name}
            <button onClick={() => onClick(user_id, action)}>{action}</button>
        </>
    );
}
