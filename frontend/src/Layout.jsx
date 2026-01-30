import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, Layout as LayoutIcon, User } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="header-nav">
                <Link to="/" className="logo-btn no-underline flex items-center gap-2">
                    <LayoutIcon size={16} />
                    <span>QuestMaster</span>
                </Link>

                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/" className="btn btn-ghost no-underline">Dashboard</Link>
                            <Link to="/achievements" className="btn btn-ghost no-underline">Achievements</Link>
                            <div className="h-4 w-px bg-white/10 mx-2"></div>
                            <span className="text-xs text-muted flex items-center gap-1 px-2">
                                <User size={14} />
                                {user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-ghost text-accent-red hover:bg-accent-red/10"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline no-underline px-4">Login</Link>
                            <Link to="/register" className="btn btn-primary no-underline px-4">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="container">
                {children}
            </main>

            <footer className="main-footer">
                &copy; 2026 QuestMaster Achievement Service. Built with passion for productivity.
            </footer>
        </>
    );
};

export default Layout;
