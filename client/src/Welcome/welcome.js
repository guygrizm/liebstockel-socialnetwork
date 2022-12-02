import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./register";
import Login from "./login";

export default function Welcome() {
    return (
        <div className="welcome">
            <h1>Welcome to Nemeton</h1>
            <img className="logo" src="/logo.png" alt="logo" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
