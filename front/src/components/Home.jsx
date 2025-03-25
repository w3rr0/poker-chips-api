import {useNavigate} from "react-router-dom";
import {useRef, useState} from "react";
import Button from "./Button.jsx";

const Home = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current

    return (
        <div className="container">
            <h1 className="center">Poker Rooms</h1>

            <div className="section">
                <h2 className="center">Enter your username</h2>
                <div className="input-group center">
                    <div className="form__group field">
                        <input
                            type="input"
                            className="form__field"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                        />
                        <label htmlFor="Username" className="form__label">Username</label>
                    </div>
                </div>
                <div className="button-container">
                    <Button caption={"Create room"} onClick={() => {navigate(`/create-room/${username}}`, { state: { username, playerId } })}}></Button>
                    <Button caption={"Join room"} onClick={() => {navigate(`/join-room/${username}}`, { state: { username, playerId } })}}></Button>
                </div>
            </div>
        </div>
    )
}

export default Home