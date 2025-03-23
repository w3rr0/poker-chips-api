// App.js
import React, { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [username, setUsername] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [playerId] = useState(localStorage.getItem('playerId') || uuidv4());

    useEffect(() => {
        localStorage.setItem('playerId', playerId);
    }, [playerId]);

    const createRoom = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/create_room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ max_players: maxPlayers })
            });
            const data = await response.json();
            navigate(`/room/${data.PIN}`, { state: { username, playerId } });
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    const joinRoom = (e) => {
        e.preventDefault();
        navigate(`/room/${pin}`, { state: { username, playerId } });
    };

    return (
        <div>
            <h1>Poker Online</h1>

            <div>
                <h2>Create New Room</h2>
                <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    min="2"
                    max="8"
                />
                <button onClick={createRoom}>Create Room</button>
            </div>

            <form onSubmit={joinRoom}>
                <h2>Join Existing Room</h2>
                <input
                    type="number"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                />
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button type="submit">Join Room</button>
            </form>
        </div>
    );
};

const Room = () => {
    const [players, setPlayers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [websocket, setWebsocket] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { pin } = useParams();
    const { username, playerId } = location.state || {};

    useEffect(() => {
        if (!username || !playerId) {
            navigate('/');
            return;
        }

        const ws = new WebSocket(`ws://localhost:8000/ws/${pin}`);

        ws.onopen = () => {
            ws.send(JSON.stringify({
                player_id: playerId,
                username,
                amount: 1000 // Initial amount
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.error) {
                console.error(data.error);
                navigate('/');
            } else if (data.players) {
                setPlayers(data.players);
            } else {
                setMessages(prev => [...prev, data]);
            }
        };

        ws.onclose = () => {
            navigate('/');
        };

        setWebsocket(ws);

        return () => {
            ws.close();
        };
    }, [pin, playerId, username, navigate]);

    const sendMessage = () => {
        if (websocket && message) {
            websocket.send(JSON.stringify({
                type: 'message',
                content: message,
                sender: username
            }));
            setMessage('');
        }
    };

    if (!username) return null;

    return (
        <div>
            <h2>Room PIN: {pin}</h2>

            <div>
                <h3>Players:</h3>
                <ul>
                    {players.map(player => (
                        <li key={player.id}>
                            {player.username} - ${player.amount}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3>Chat:</h3>
                <div>
                    {messages.map((msg, i) => (
                        <p key={i}>{msg.sender}: {msg.content}</p>
                    ))}
                </div>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:pin" element={<Room />} />
            </Routes>
        </Router>
    );
}