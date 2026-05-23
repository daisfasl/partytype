import { NavLink } from 'react-router-dom'
import { IoPerson, IoPlay } from "react-icons/io5";
import { FaKeyboard, FaInfoCircle } from 'react-icons/fa'

function NavBar({gameStatus}) {
    const isWaiting = gameStatus === "waiting"

    const activeClass = `flex items-center justify-center gap-4 font-mono transition-all duration-300 ease-in-out ${
    isWaiting ? "opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-4 pointer-events-none"
}`;
    return (
        <nav className={activeClass}>
            <NavLink to="/" className="gap-4 text-lg text-white font-bold">partyType</NavLink>
            <div className="flex gap-4 text-gray-400 text-xl">
                <NavLink to="/play" className="hover:text-stone-300">
                    <IoPlay />
                </NavLink>
                <NavLink to="/" className="hover:text-stone-300">
                    <FaKeyboard />
                </NavLink>
                <NavLink to="/about" className="hover:text-stone-300">
                    <FaInfoCircle />
                </NavLink>
                <NavLink to="/profile" className="hover:text-stone-300">
                    <IoPerson />
                </NavLink>
            </div>
        </nav>
    )
}

export default NavBar