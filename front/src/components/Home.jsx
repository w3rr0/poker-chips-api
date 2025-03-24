import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";

const Home = () => {
    const navigate = useNavigate()
    const [pin, setPin] = useState('')
    const [username, setUsername] = useState('')
    const [maxPlayers, setMaxPlayers] = useState(4)
    const playerId = useRef(localStorage.getItem('playerId') || crypto.randomUUID()).current

    useEffect(() => {
        localStorage.setItem('playerId', playerId)
    }, [playerId])

    const createRoom = async () => {
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
            <h1>Poker Rooms</h1>

            <div className="section">
                <h2>Create New Room</h2>
                <div className="input-group">
                    <label>Max Players:</label>
                    <input
                        type="number"
                        min="2"
                        max="8"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Math.max(2, Math.min(8, e.target.valueAsNumber)))}
                    />
                </div>
                <button onClick={createRoom}>Create Room</button>
            </div>

            <div className="section">
                <h2>Join Existing Room</h2>
                <div className="input-group">
                    <input
                        type="number"
                        placeholder="Enter PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/, '').slice(0, 6))}
                    />
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                    />
                </div>
                <button onClick={() => navigate(`/room/${pin}`, { state: { username, playerId } })}>
                    Join Room
                </button>
            </div>
        </div>
    )
}

export default Home