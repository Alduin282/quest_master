import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="center-vh">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md animate-fade"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Join Quests</h2>
                    <p className="text-muted">Start turning your tasks into achievements</p>
                </div>

                {error && (
                    <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-4 rounded mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green p-4 rounded mb-6 flex items-center gap-3">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Account created! Redirecting...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Username</label>
                        <input
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Pick a unique name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Email (Optional)</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>


                    <div className="form-actions">
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="btn btn-primary px-8 py-4 text-base font-bold uppercase tracking-widest"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <UserPlus size={20} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center text-sm border-t border-glass-border pt-6">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" className="text-accent-blue font-bold hover:text-white transition-colors no-underline">Sign in</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
