import {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Board from "./Board.jsx";

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
        <div className="container room-container">
            <h2>Room PIN: {pin}</h2>

            <div className="game-layout" style={{paddingBottom: "20px"}}>
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
            <Board players={players} ></Board>
        </div>
    )
}

export default Room