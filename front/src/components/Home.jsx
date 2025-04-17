import {useNavigate} from "react-router-dom";
import React, {useRef, useState} from "react";
import Button from "./Button.jsx";

const Home = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current

    const checkUsername = () => {
        if (username.length > 0 && username.length <= 15) {
            return true
        }
    }

    return (
        <div className="container">
            <img src="/pokerchips.png" alt="POKERCHIP$" width="300px" style={{ display: 'block', margin: "0 auto" }} />

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
                    <Button caption={"Create room"} onClick={() => {if (checkUsername()) {
                        navigate('/create-room', {state: {username, playerId}})
                    }}}></Button>
                    <Button caption={"Join room"} onClick={() => {if (checkUsername()) {
                        navigate('/join-room', {state: {username, playerId}})
                    }}}></Button>
                </div>
            </div>
        </div>
    )
}

export default Home