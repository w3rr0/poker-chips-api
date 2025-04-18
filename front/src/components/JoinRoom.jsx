import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import Button from "./Button.jsx";
import PinInput from "./PinInput.jsx";


const JoinRoom = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('')
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current
    const { state } = useLocation()
    const { username } = state || {}

    useEffect(() => {
        localStorage.setItem('playerId', playerId)
    }, [playerId])

    const handleJoinRoom = () => {
        if (pin.length === 6) {
            navigate(`/room/${pin}`, { state: { username, playerId } })
        } else {
            alert('Invalid PIN. Please enter a 6-digit PIN.')
        }
    };

    return (
        <div className="container">
            <img src="/pokerchips.png" alt="POKERCHIP$" width="300px" style={{ display: 'block', margin: "0 auto", cursor: "pointer" }} onClick={() => navigate("/")} />

            <div className="section center">
                <h2>Join Existing Room</h2>
                <PinInput onChange={setPin}/>
                <Button caption={"Join Existing Room"} onClick={handleJoinRoom}></Button>
            </div>
        </div>
    )
}

export default JoinRoom