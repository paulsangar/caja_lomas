import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import RegistroPublico from './RegistroPublico';

function App() {
    const [view, setView] = useState('login'); // 'login' | 'register'

    useEffect(() => {
        // Simple URL check for direct access
        // if (window.location.pathname.includes('registro')) {
        //    setView('register');
        // }

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        setView('login');
    };

    if (loading) return null;

    if (view === 'register') {
        return <RegistroPublico onBack={() => {
            setView('login');
            window.history.pushState({}, '', '/');
        }} />;
    }

    return (
        <div className="app-container">
            {!user ? (
                <Login
                    onLoginSuccess={setUser}
                    onRegisterClick={() => {
                        setView('register');
                        window.history.pushState({}, '', '/registro');
                    }}
                />
            ) : (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
