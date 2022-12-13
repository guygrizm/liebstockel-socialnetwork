export default function Delete() {
    async function deleteProfile(event) {
        event.preventDefault();
        if (!confirm("Are you sure?")) {
            return;
        }
        await fetch("/api/delete", { method: "POST" });
        window.location.reload();
    }

    return (
        <form onSubmit={deleteProfile}>
            <button className="delete-button">Delete Account</button>
        </form>
    );
}
