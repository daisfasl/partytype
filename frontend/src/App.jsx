import { Routes, Route, BrowserRouter } from 'react-router-dom'
import NavBar from './components/NavBar'
import Practice from './pages/Practice'
import Play from './pages/Play'
import About from './pages/About'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App() {
    return (
        <BrowserRouter>
        <div className="h-screen bg-[#323437]">
            <Routes>
                <Route path="/" element={<Practice />} />
                <Route path="/play" element={<Play />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </div>
        </BrowserRouter>
    )
}

export default App