export default function ProfileImage({ onClick, user }) {
    if (!user.profile_picture_url)
        user.profile_picture_url = "https://via.placeholder.com/100x100";

    return (
        <img
            onClick={onClick}
            className="profile-picture"
            src={user.profile_picture_url}
            alt={`${user.first_name} ${user.last_name}`}
        ></img>
    );
}
