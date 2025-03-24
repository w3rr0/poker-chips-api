import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Room from './Room'
import Home from './Home'

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