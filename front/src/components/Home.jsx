import {useNavigate} from "react-router-dom";
import React, {useRef, useState} from "react";
import Button from "./Button.jsx";
import {trim} from "stylis";

const Home = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current
    const [displayWarning, setDisplayWarning] = useState('')

    const checkUsername = () => {
        if (trim(username).length === 0) {
            setDisplayWarning("You must enter a username")
        } else if (trim(username).length > 15) {
            setDisplayWarning("Username must be less than 15 characters")
        } else {
            return true
        }
        return false
    }

    return (
        <div className="menu-container">
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
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="Username" className="form__label">Username</label>
                        <label className="username-warning">{displayWarning}</label>
                    </div>
                </div>
                <div className="button-container">
                    <Button caption={"Create room"} onClick={() => {if (checkUsername()) {
                        navigate('/create-room', {state: {username: trim(username), playerId}})
                    }}}></Button>
                    <Button caption={"Join room"} onClick={() => {if (checkUsername()) {
                        navigate('/join-room', {state: {username: trim(username), playerId}})
                    }}}></Button>
                </div>
            </div>
        </div>
    )
}

export default Home