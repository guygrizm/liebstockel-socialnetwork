export default function Modal({ onClick, updatePic }) {
    function handleChange(event) {
        console.log(event.target.files[0]);
    }

    async function uploadPic(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const response = await fetch("/api/users/profilePicture", {
            method: "POST",
            body: formData,
        });
        const updatedUser = await response.json();
        updatePic(updatedUser.profile_picture_url);
    }

    return (
        <div className="modal">
            <div onClick={onClick} className="close-button">
                ✖
            </div>
            <form onSubmit={uploadPic}>
                <input
                    onChange={handleChange}
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                />
                <button>Upload</button>
            </form>
        </div>
    );
}
