export default function ProfilePicture({
    onClick,
    first_name,
    last_name,
    profile_picture_url = "https://via.placeholder.com/100x100",
}) {
    return (
        <img
            onClick={onClick}
            className="profile-picture"
            src={profile_picture_url}
            alt={`${first_name} ${last_name}`}
        ></img>
    );
}
