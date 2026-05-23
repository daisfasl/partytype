import { NavLink } from 'react-router-dom'

function NavBar() {
    return (
        <nav className="flex items-center justify-center gap-4 font-mono">
            <NavLink to="/" className="gap-4 text-lg text-white font-bold">partyType</NavLink>
            <div className="flex gap-4 text-gray-400">
                <NavLink to="/" className= "hover:text-stone-300">Practice</NavLink>
                <NavLink to="/play" className= "hover:text-stone-300">Play</NavLink>
                <NavLink to="/about" className= "hover:text-stone-300">About</NavLink>
            </div>
        </nav>
    )
}

export default NavBar