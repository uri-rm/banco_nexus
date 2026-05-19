
export default function FlashMessages({ messages, open, onClose }) {
    return (
        <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {messages.map((msg, index) => (
                <div key={index} className={`mb-2 px-4 py-2 rounded shadow 
                ${msg.type === 'success' ? 'bg-green-400 border-2 border-green-600 shadow-green-400  text-white' 
                : 'bg-red-500 border-2 border-red-600 shadow-red-400 text-white'}`}>
                    {msg.text}
                </div>
            ))}
            {open && (<button onClick={onClose} className="mt-2 text-sm text-gray-700 hover:underline">Cerrar</button>
            )}
        </div>
    );
}