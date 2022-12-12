import ProfilePicture from "./profilePicture";
import BioEditor from "./bioEditor.js";

export default function Profile({
    first_name,
    last_name,
    profile_picture_url,
    bio,
    onBioUpdate,
}) {
    return (
        <section className="profile">
            <ProfilePicture
                first_name={first_name}
                last_name={last_name}
                profile_picture_url={profile_picture_url}
            />
            <h2>
                {" "}
                Welcome, <br></br>
                <br></br>
                {first_name} {last_name}
            </h2>
            <BioEditor bio={bio} onBioUpdate={onBioUpdate} />
        </section>
    );
}
