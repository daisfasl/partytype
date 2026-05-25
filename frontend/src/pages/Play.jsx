import { useState } from 'react';
import NavBar from '../components/NavBar'

function Play() {
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center font-mono text-stone-300 select-none gap-4">
            <NavBar gameStatus={"waiting"} />
            <div className="w-full max-w-3xl border border-[#2c2e31] p-8 relative gap-12">
                <p className="text-center text-[#d1d0c5]">
                    [ Base ]
                </p>
            </div>

        </div>
    );
}

export default Play