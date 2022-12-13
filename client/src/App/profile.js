import ProfilePicture from "./profilePicture";
import BioEditor from "./bioEditor.js";
import Delete from "./delete.js";

export default function Account({
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
                Welcome, &nbsp;
                {first_name} {last_name}
            </h2>
            <BioEditor bio={bio} onBioUpdate={onBioUpdate} />
            <Delete></Delete>
        </section>
    );
}
