export default function Modal({ onClick, updateImg }) {
    function handleChange(event) {
        console.log(event.target.files[0]);
    }

    async function uploadImage(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const awaitingData = await fetch("/api/users/profileImage", {
            method: "POST",
            body: formData,
        });
        const updatedUser = await awaitingData.json();
        updateImg(updatedUser);
    }

    return (
        <div className="modal">
            <div onClick={onClick} className="x">
                ✖
            </div>
            <form onSubmit={uploadImage}>
                <input
                    onChange={handleChange}
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                />
                <button>Submit</button>
            </form>
        </div>
    );
}
