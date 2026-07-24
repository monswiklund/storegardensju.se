// 🟣 Importer + struktur
import { useState, useEffect } from "react";
import Header from "./Header"; // 🟩 komponent

// 🟣 Funktionell komponent (struktur)
function App() {
    // 💛 variabler / state
    const [count, setCount] = useState(0);
    const [user] = useState({ name: "Måns", age: 25 });

    // 💙 side effect / systemhandling
    useEffect(() => {
        console.log("Component mounted"); // 💙
    }, []);

    // 🟣 logik
    const handleClick = () => {
        setCount(count + 1); // 💛 + 💗
    };

    // 🧡 JSX
    return (
        <div className="app"> {/* 💚 */}
            <Header user={user} /> {/* 🟩 */}
            <h1>Hej {user.name}!</h1> {/* 🧡 */}
            <p>Du har klickat {count} gånger.</p>
            <button onClick={handleClick}>Klicka mig</button>
        </div>
    );
}

export default App; // 🟣 export
