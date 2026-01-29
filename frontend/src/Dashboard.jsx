import React, { useState, useEffect } from 'react';
import api from './api';
import { Plus, Play, CheckCircle, RefreshCcw, Clock, Target, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge = ({ status }) => {
    const styles = {
        created: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
        active: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
        completed: 'bg-accent-green/10 text-accent-green border-accent-green/20'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status]}`}>
            {status}
        </span>
    );
};

const QuestCard = ({ quest, onAction, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card flex flex-col h-full"
            style={{ padding: '20px' }}
        >
            <div className="flex justify-between items-start mb-4">
                <StatusBadge status={quest.status} />
                <button
                    onClick={() => onDelete(quest.id)}
                    className="text-text-muted hover:text-accent-red transition-colors p-1"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <h3 className="text-lg font-bold text-text-bright mb-2 line-clamp-1">{quest.title}</h3>
            <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-3">{quest.description}</p>

            {quest.status === 'active' && quest.end_time && (
                <div className="flex items-center gap-2 text-accent-orange mb-6 text-xs font-mono bg-accent-orange/5 p-2 rounded">
                    <Clock size={14} />
                    <span>Ends: {new Date(quest.end_time).toLocaleTimeString()}</span>
                </div>
            )}

            <div className="flex gap-2 mt-auto">
                {quest.status === 'created' && (
                    <button
                        onClick={() => onAction(quest.id, 'start')}
                        className="btn btn-primary flex-1 justify-center gap-2"
                    >
                        <Play size={14} /> Start
                    </button>
                )}
                {quest.status === 'active' && (
                    <button
                        onClick={() => onAction(quest.id, 'complete')}
                        className="btn btn-primary flex-1 justify-center gap-2 bg-accent-green hover:bg-accent-green/80 border-none"
                    >
                        <CheckCircle size={14} /> Complete
                    </button>
                )}
                {quest.status === 'completed' && (
                    <button
                        onClick={() => onAction(quest.id, 'restart')}
                        className="btn btn-outline flex-1 justify-center gap-2"
                    >
                        <RefreshCcw size={14} /> Restart
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newQuest, setNewQuest] = useState({ title: '', description: '', planned_achievement_name: '' });

    const fetchQuests = async () => {
        try {
            const res = await api.get('quests/');
            setQuests(res.data);
        } catch (err) {
            console.error('Failed to fetch quests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('quests/', newQuest);
            setQuests([res.data, ...quests]);
            setNewQuest({ title: '', description: '', planned_achievement_name: '' });
            setShowAddForm(false);
        } catch (err) {
            alert('Error creating quest. Make sure all fields are filled.');
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.post(`quests/${id}/${action}/`);
            fetchQuests();
        } catch (err) {
            alert(`Failed to ${action} quest`);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this quest?')) return;
        try {
            await api.delete(`quests/${id}/`);
            setQuests(quests.filter(q => q.id !== id));
        } catch (err) {
            alert('Failed to delete quest');
        }
    };

    if (loading) return <div className="center-vh text-text-muted">Loading protocol...</div>;

    return (
        <div className="animate-fade">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Target className="text-accent-blue" size={32} />
                        Active Missions
                    </h1>
                    <p className="text-text-muted mt-1">Manage your journey and track achievements</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'} px-6 py-2.5 rounded-sm`}
                >
                    {showAddForm ? 'Cancel' : (
                        <>
                            <Plus size={18} />
                            New Quest
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <form onSubmit={handleCreate} className="glass-card p-8 border-accent-blue/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Mission Title</label>
                                    <input
                                        value={newQuest.title}
                                        onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                                        placeholder="E.g. Daily Workout"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Briefing</label>
                                    <input
                                        value={newQuest.description}
                                        onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                                        placeholder="What needs to be done?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Future Reward Name</label>
                                    <input
                                        value={newQuest.planned_achievement_name}
                                        onChange={(e) => setNewQuest({ ...newQuest, planned_achievement_name: e.target.value })}
                                        placeholder="E.g. Master of Cardio"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="btn btn-primary px-10 py-3">
                                    Deploy Mission
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {quests.length === 0 ? (
                <div className="center-vh h-64 border-2 border-dashed border-glass-border rounded-lg text-text-muted">
                    No active missions. Click "New Quest" to begin.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {quests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                onAction={handleAction}
                                onDelete={handleDelete}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
