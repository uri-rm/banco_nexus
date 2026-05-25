import { useEffect, useState } from "react";

export default function FlashMessages({ messages, open, onClose }) {
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            setClosing(true);
            setTimeout(() => {
                onClose();
                setClosing(false);
            }, 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [open, messages]);

    return (
        <div className={`w-full transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}  
         ${closing ? 'slide-out' : 'slide'}`}>
            {messages.map((msg, index) => (
                <div key={index} className={`mb-2 px-4 py-2 rounded shadow w-full
                ${msg.type === 'success' 
                    ? 'bg-green-400 border-2 border-green-600 shadow-green-400 text-white' 
                    : 'bg-red-500 border-2 border-red-600 shadow-red-400 text-white'}`}>
                    {msg.text}
                </div>
            ))}
        </div>
    );
}