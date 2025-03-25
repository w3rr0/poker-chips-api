import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Room from './Room'
import Home from './Home'
import CreateRoom from "./CreateRoom.jsx";
import JoinRoom from "./JoinRoom.jsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room/:pin" element={<Room />} />
                <Route path="/create-room/:username" element={<CreateRoom />} />
                <Route path="/join-room/:username" element={<JoinRoom />} />
            </Routes>
        </Router>
    )
}