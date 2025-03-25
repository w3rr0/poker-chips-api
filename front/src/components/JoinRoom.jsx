import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import Button from "./Button.jsx";


const JoinRoom = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('')
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current
    const { state } = useLocation()
    const { username } = state || {}

    useEffect(() => {
        localStorage.setItem('playerId', playerId)
    }, [playerId])

    return (
        <div className="container">
            <h1 className="center">Join Room</h1>

            <div className="section">
                <h2>Join Existing Room</h2>
                <div className="input-group">
                    <input
                        type="number"
                        placeholder="Enter PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/, '').slice(0, 6))}
                    />
                </div>
                <Button caption={"Join Existing Room"} onClick={() => navigate(`/room/${pin}`, { state: { username, playerId } })}></Button>
            </div>
        </div>
    )
}

export default JoinRoom