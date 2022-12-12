import { useState } from "react";

export default function BioEditor({ bio, onBioUpdate }) {
    const [isEditing, setEditing] = useState(false);
    const [newBioEntry, setNewBioEntry] = useState("");

    function onEditButtonClick() {
        console.log("BioEditor:onEditButtonClick");
        setEditing(!isEditing);
    }

    async function onSubmit(event) {
        /* console.log("BioEditor:onSubmit", newBio); */
        event.preventDefault();

        const response = await fetch("/api/users/bio", {
            method: "POST",
            body: JSON.stringify({ bio: newBioEntry }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("response", data);
        setEditing(false);
        onBioUpdate(data.bio);
    }

    function handleChange(event) {
        const newBioText = event.target.value;
        setNewBioEntry(newBioText);
    }
    function renderForm() {
        return (
            <form onSubmit={onSubmit}>
                <textarea
                    name="bio"
                    defaultValue={bio}
                    onChange={handleChange}
                />
                <button>Save Bio</button>
            </form>
        );
    }

    const buttonLabel = isEditing ? "Cancel" : "Edit Bio";

    return (
        <div className="bio-editor">
            {isEditing ? (
                renderForm()
            ) : (
                <p>
                    My Bio:
                    {bio}
                </p>
            )}
            <button onClick={onEditButtonClick}>{buttonLabel}</button>
        </div>
    );
}
