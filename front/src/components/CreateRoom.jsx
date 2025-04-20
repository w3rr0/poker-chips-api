import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "./Button.jsx";
import RadioButtons from "./RadioButtons.jsx";


const CreateRoom = () => {
    const navigate = useNavigate()
    const [maxPlayers, setMaxPlayers] = useState(9)
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current
    const { state } = useLocation()
    const { username } = state || {}

    useEffect(() => {
        localStorage.setItem('playerId', playerId)
    }, [playerId])

    const createNewRoom = async () => {
        try {
            const response = await fetch('http://localhost:8000/create_room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ max_players: maxPlayers })
            })

            if (!response.ok) throw new Error('Failed to create room')

            const { PIN } = await response.json()
            navigate(`/room/${PIN}`, { state: { username, playerId, maxPlayers } })
        } catch (error) {
            console.error('Error creating room:', error)
            alert('Failed to create room')
        }
    }

    return (
        <div className="menu-container center">
            <img src="/pokerchips.png" alt="POKERCHIP$" width="300px" style={{ display: 'block', margin: "0 auto", cursor: "pointer" }} onClick={() => navigate("/")} />

            <div className="section">
                <h2>Create New Room</h2>
                <RadioButtons selectedValue={maxPlayers} onChange={setMaxPlayers} />
                <div className="note">Note: if you don't need the limit just leave it at max</div>
                <div className="gap15"/>
                <Button caption={"Create New Room"} onClick={createNewRoom}></Button>
            </div>
        </div>
    )
}

export default CreateRoom