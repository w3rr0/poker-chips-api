import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import Button from "./Button.jsx";


const CreateRoom = ({ username }) => {
    const navigate = useNavigate()
    const [maxPlayers, setMaxPlayers] = useState(4)
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current

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
            navigate(`/room/${PIN}`, { state: { username, playerId } })
        } catch (error) {
            console.error('Error creating room:', error)
            alert('Failed to create room')
        }
    }

    return (
        <div className="container">
            <h1 className="center">Create Room</h1>

            <div className="section">
                <h2>Create New Room</h2>
                <div className="input-group">
                    <input
                        type="number"
                        min="2"
                        max="8"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Math.max(2, Math.min(8, e.target.valueAsNumber)))}
                    />
                </div>
                <Button caption={"Create New Room"} onClick={createNewRoom}></Button>
            </div>
        </div>
    )
}

export default CreateRoom