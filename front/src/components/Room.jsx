import {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Board from "./Board.jsx";
// eslint-disable-next-line no-unused-vars
import { useSpring, animated } from '@react-spring/web';
import TopBar from "./TopBar.jsx";
import CollectButton from "./CollectButton.jsx";
import {useMediaQuery} from "react-responsive";

const Room = () => {
    const [players, setPlayers] = useState([])
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const ws = useRef(null)
    const { pin } = useParams()
    const { state } = useLocation()
    const { username, playerId, maxPlayers } = state || {}
    const navigate = useNavigate()
    const messageQueue = useRef([]);
    const [puttedAmount, setPuttedAmount] = useState(0)
    const [yourPutted, setYourPutted] = useState(0)
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [animatedToken, setAnimatedToken] = useState(null);
    const [playersLimit, setPlayersLimit] = useState(maxPlayers);
    const isLargeScreen = useMediaQuery({ minWidth: 980 });
    const messagesContainerRef = useRef(null);

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
                    setPlayersLimit(data.maxPlayers)
                } else if (data.type === 'message') {
                    setMessages(prev => [...prev, data])
                } else if (data.type === 'put_token') {
                    if (data.playerId === playerId) {
                        setYourPutted(prev => prev + data.content)
                    }
                } else if (data.type === 'claim_all') {
                    if (data.players) {
                        setPlayers(Object.values(data.players))
                    }
                    setPuttedAmount(0)
                    setYourPutted(0)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin, username, playerId, navigate])

    useEffect(() => {
      setPlayersLimit(maxPlayers);
    }, [maxPlayers]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

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
                type: "message",
                content: message.trim(),
                sender: username,
                senderId: playerId,
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

    const handleCollectYours = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: "put_token",
                content: -yourPutted,
                playerId: playerId,
            }))
        }
    }
    const handleCollectAll = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: "claim_all",
                playerId: playerId,
            }))
        }
    }
    const handleLeaveRoom = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.close()
        }
        navigate('/');
    }

    if (!username) return null

    return (
        <div className="container room-container">
            <TopBar pin={pin} players_amount={players.length} max_players={playersLimit}/>

            <div className="board-and-chat" >
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {!isLargeScreen && (<div className="game-layout">
                        <div className="action-buttons">
                            <div className="collect-buttons">
                                <CollectButton text="All" type="collect" onClick={handleCollectAll}/>
                                <CollectButton text="Yours" type="collect" onClick={handleCollectYours}/>
                            </div>
                            <div className="collect-buttons leave"/>
                            <CollectButton text="Leave Room" type="leave" onClick={handleLeaveRoom} />
                        </div>
                    </div>)}
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
                {isLargeScreen && (
                    <div className="side-layout">
                        <div className="control-buttons">
                            <CollectButton text="All" type="collect" onClick={handleCollectAll}/>
                            <CollectButton text="Yours" type="collect" onClick={handleCollectYours}/>
                            <div className="gap15" />
                            <CollectButton text="Leave Room" type="leave" onClick={handleLeaveRoom}/>
                        </div>
                        <div className="chat-section">
                        <div className="messages" ref={messagesContainerRef}>
                            {messages.map((msg, i) => {
                                const isMyMessage = msg.senderId && msg.senderId === playerId;
                                const isSystemJoin = msg.senderId && msg.senderId === "system-join";
                                const isSystemLeft = msg.senderId && msg.senderId === "system-left";
                                const isSystemWin = msg.senderId && msg.senderId === "system-win";

                                return (
                                    <div key={i} className={`message ${isMyMessage ? 'my-message' : isSystemJoin ? 'system-join' : isSystemLeft ? 'system-left' : isSystemWin ? 'system-win' : ''}`} >
                                        <strong>{(msg.senderId && msg.senderId === playerId) ? "You" : msg.sender || ""}{!isSystemLeft && !isSystemJoin && !isSystemWin && ": "}</strong>{msg.content}
                                    </div>
                                )
                            })}
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
                </div>)}
            </div>
        </div>
    )
}

export default Room