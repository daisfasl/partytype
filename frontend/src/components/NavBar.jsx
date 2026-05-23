import { NavLink } from 'react-router-dom'
import { IoPerson, IoPlay } from "react-icons/io5";
import { FaKeyboard, FaInfoCircle } from 'react-icons/fa'

function NavBar() {
    return (
        <nav className="flex items-center justify-center gap-4 font-mono">
            <NavLink to="/" className="gap-4 text-lg text-white font-bold">partyType</NavLink>
            <div className="flex gap-4 text-gray-400 text-xl">
                <NavLink to="/" className="hover:text-stone-300">
                    <FaKeyboard />
                </NavLink>
                <NavLink to="/play" className="hover:text-stone-300">
                    <IoPlay />
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