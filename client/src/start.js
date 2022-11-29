import { createRoot } from "react-dom/client";
import Welcome from "./Welcome/welcome";
import App from "./App/app";

const root = createRoot(document.querySelector("main"));
fetch("/api/user/me")
    .then((response) => response.json())
    .then((data) => {
        if (!data) {
            root.render(<Welcome />);
        } else {
            root.render(<App />);
        }
    });
