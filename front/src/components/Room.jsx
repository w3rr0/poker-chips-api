import {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Board from "./Board.jsx";
// eslint-disable-next-line no-unused-vars
import { useSpring, animated } from '@react-spring/web';
import TopBar from "./TopBar.jsx";

const Room = () => {
    const [players, setPlayers] = useState([])
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const ws = useRef(null)
    const { pin } = useParams()
    const { state } = useLocation()
    const { username, playerId } = state || {}
    const navigate = useNavigate()
    const messageQueue = useRef([]);
    const [puttedAmount, setPuttedAmount] = useState(0)
    const [yourPutted, setYourPutted] = useState(0)
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [animatedToken, setAnimatedToken] = useState(null);

    useEffect(() => {
        if (!username || !playerId) {
            navigate('/')
            return
        }

        const connectWebSocket = () => {
            ws.current = new WebSocket(`ws://localhost:8000/ws/${pin}`)

            ws.current.onopen = () => {
                console.log('WebSocket connected')

                while (messageQueue.current.length > 0) {
                    ws.current.send(JSON.stringify(messageQueue.current.shift()));
                }

                sendWhenOpen({
                    player_id: playerId,
                    username,
                    amount: 1000,
                    putted: puttedAmount,
                });
            }

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data)
                data.playerAmount = 0;
                console.log("Received data:", data)

                if (data.error) {
                    console.error('Server error:', data.error)
                    navigate('/')
                    return
                }

                if (data.type === 'players_update') {
                    setPlayers(Object.values(data.players))
                    setPuttedAmount(data.putted)
                } else if (data.type === 'message') {
                    setMessages(prev => [...prev, data])
                } else if (data.type === 'put_token') {
                    if (data.playerId === playerId) {
                        setYourPutted(prev => prev + data.content)
                    }
                } else if (data.type === 'putted_update') {
                    setPuttedAmount(data.amount)
                } else {
                    console.log('Unhandled message:', data)
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

    useEffect(() => {
        console.log("Players updated:", players)
    }, [players]);

    const sendWhenOpen = (data) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        } else {
            messageQueue.current.push(data);
            console.warn("WebSocket not open, message queued.");
        }
    };

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

    const animationProps = useSpring({
        from: {
            x: animatedToken?.startX || 0,
            y: animatedToken?.startY || 0,
            opacity: 1
        },
        to: {
            x: animatedToken?.endX || 0,
            y: animatedToken?.endY || 0,
            opacity: 0
        },
        config: { duration: 250 },
        reset: true,
        onRest: () => setAnimatedToken(null),
    });

    const putToken = (amount, startPosition) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'put_token',
                content: amount,
                playerId: playerId,
            }))
            setAnimatedToken({
                startX: startPosition.x,
                startY: startPosition.y,
                endX: center.x,
                endY: center.y,
                amount: amount
            });
        }
    }

    const handleCenterChange = (newCenter) => {
        setCenter(newCenter);
    }

    console.log("Center:", center);

    if (!username) return null

    return (
        <div className="container room-container">
            <TopBar pin={pin} players_amount={players.length} max_players={4}/>

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
            <Board players={players} playerId={playerId} handlePutToken={putToken} puttedAmount={puttedAmount} yourPutted={yourPutted} handleCenterChange={handleCenterChange}></Board>
            {animatedToken && (
                <animated.div
                    style={{
                        position: 'fixed',
                        left: animationProps.x.to(x => `${x}px`),
                        top: animationProps.y.to(y => `${y}px`),
                        opacity: animationProps.opacity,
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}>
                    <img
                        src={`/tokens-img/${animatedToken.amount}.png`}
                        alt="token"
                        width="40px"
                        height="40px"
                    />
                </animated.div>
            )}
        </div>
    )
}

export default Room