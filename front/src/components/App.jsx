// App.jsx
import { useState, useEffect, useRef } from 'react'
import {BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation} from 'react-router-dom'

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

const Room = () => {
    const [players, setPlayers] = useState([])
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const ws = useRef(null)
    const { pin } = useParams()
    const { state } = useLocation()
    const { username, playerId } = state || {}
    const navigate = useNavigate()

    useEffect(() => {
        if (!username || !playerId) {
            navigate('/')
            return
        }

        const connectWebSocket = () => {
            ws.current = new WebSocket(`ws://localhost:8000/ws/${pin}`)

            ws.current.onopen = () => {
                console.log('WebSocket connected')
                ws.current.send(JSON.stringify({
                    player_id: playerId,
                    username,
                    amount: 1000
                }))
            }

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.error) {
                    console.error('Server error:', data.error)
                    navigate('/')
                    return
                }

                if (data.players) {
                    setPlayers(Object.values(data.players))
                } else {
                    setMessages(prev => [...prev, data])
                }
            }

            ws.current.onclose = () => {
                console.log('WebSocket closed')
                navigate('/')
            }

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error)
                navigate('/')
            }
        }

        connectWebSocket()

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close()
            }
        }
    }, [pin, username, playerId, navigate])

    const sendMessage = () => {
        if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'message',
                content: message.trim(),
                sender: username
            }))
            setMessage('')
        }
    }

    if (!username) return null

    return (
        <div className="container">
            <h2>Room PIN: {pin}</h2>

            <div className="game-layout">
                <div className="players-list">
                    <h3>Players:</h3>
                    {players.map(player => (
                        <div key={player.id} className="player-card">
                            <span>{player.username}</span>
                            <span>${player.amount}</span>
                        </div>
                    ))}
                </div>

                <div className="chat-section">
                    <div className="messages">
                        {messages.map((msg, i) => (
                            <div key={i} className="message">
                                <strong>{msg.sender}:</strong> {msg.content}
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:pin" element={<Room />} />
            </Routes>
        </Router>
    )
}