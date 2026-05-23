import { Routes, Route, BrowserRouter } from 'react-router-dom'
import NavBar from './components/NavBar'
import Practice from './pages/PracticePage'
import Play from './pages/PlayPage'
import About from './pages/AboutPage'

function App() {
    return (
        <BrowserRouter>
        <div className="h-screen bg-[#323437]">
            <Routes>
                <Route path="/" element={<Practice />} />
                <Route path="/play" element={<Play />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </div>
        </BrowserRouter>
    )
}

export default App