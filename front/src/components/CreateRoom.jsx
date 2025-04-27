import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "./Button.jsx";
import RadioButtons from "./RadioButtons.jsx";
import { apiUrl } from "../../public/static.js";
import GithubLink from "./GithubLink.jsx";
import SliderInput from "./SliderInput.jsx";
import { defaultAmount } from "../../public/static.js";


const CreateRoom = () => {
    const navigate = useNavigate()
    const [maxPlayers, setMaxPlayers] = useState(9)
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current
    const { state } = useLocation()
    const { username } = state || {}
    const [startingAmount, setStartingAmount] = useState(defaultAmount)

    useEffect(() => {
        localStorage.setItem('playerId', playerId)
    }, [playerId])

    const createNewRoom = async () => {
        try {
            const response = await fetch(`${apiUrl}/create_room`, {
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
                <div style={{ width: "270px", margin: "0 auto" }} >
                    <SliderInput value={startingAmount} onChange={setStartingAmount} />
                </div>
                <div className="pin-input">
                    <div className="mobile">
                        <p style={{ alignContent: "flex-start", marginLeft: "13px" }}>2</p>
                        <p style={{ alignContent: "flex-end", marginRight: "13px" }}>9</p>
                    </div>
                    <p className="regular">2</p>
                    <RadioButtons selectedValue={maxPlayers} onChange={setMaxPlayers} />
                    <p className="regular">9</p>
                </div>
                <div className="note">Note: if you don't need the limit just leave it at max</div>
                <div className="gap15"/>
                <Button caption={"Create New Room"} onClick={createNewRoom}></Button>
            </div>
            <GithubLink/>
        </div>
    )
}

export default CreateRoom