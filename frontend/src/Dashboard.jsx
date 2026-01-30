import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { Plus, Play, CheckCircle, RefreshCcw, Clock, Target, Trash2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS, ERROR_MESSAGES, FORM_LABELS, QUEST_ACTIONS, QUEST_STATUS, TIME_LABELS, UI_LABELS } from './constants';

export const StatusBadge = ({ status }) => {
    const styles = {
        [QUEST_STATUS.created]: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
        [QUEST_STATUS.active]: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
        [QUEST_STATUS.completed]: 'bg-accent-green/10 text-accent-green border-accent-green/20',
        [QUEST_STATUS.failed]: 'bg-accent-red/10 text-accent-red border-accent-red/20'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status]}`} >
            {status}
        </span >
    );
};

export const QuestCard = ({ quest, onAction, onDelete }) => {
    const [isStarting, setIsStarting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Duration components
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);

    const handleStartConfirm = () => {
        const totalMinutes = (parseInt(days) * 24 * 60) + (parseInt(hours) * 60) + (parseInt(minutes) || 0);
        if (totalMinutes < 1) {
            alert("Quest must be at least 1 minute long.");
            return;
        }
        onAction(quest.id, 'start', { duration_minutes: totalMinutes });
        setIsStarting(false);
    };

    const isLongDescription = quest.description && quest.description.length > 120;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card flex flex-col h-full transition-all duration-300"
            style={{ padding: '20px' }}
        >
            <div className="flex justify-between items-start mb-4">
                <StatusBadge status={quest.status} />
                <button
                    onClick={() => onDelete(quest.id)}
                    className="text-text-muted hover:text-accent-red transition-colors p-1 cursor-pointer"
                    title={QUEST_ACTIONS.delete}
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex gap-2 mb-2">
                {quest.difficulty === DIFFICULTY_LEVELS.easy && <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest bg-accent-green/10 px-2 py-0.5 rounded border border-accent-green/20">{DIFFICULTY_LABELS.easy}</span>}
                {quest.difficulty === DIFFICULTY_LEVELS.medium && <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest bg-accent-blue/10 px-2 py-0.5 rounded border border-accent-blue/20">{DIFFICULTY_LABELS.medium}</span>}
                {quest.difficulty === DIFFICULTY_LEVELS.hard && <span className="text-[10px] font-bold text-accent-orange uppercase tracking-widest bg-accent-orange/10 px-2 py-0.5 rounded border border-accent-orange/20">{DIFFICULTY_LABELS.hard}</span>}
                {quest.difficulty === DIFFICULTY_LEVELS.insane && <span className="text-[10px] font-bold text-accent-red uppercase tracking-widest bg-accent-red/10 px-2 py-0.5 rounded border border-accent-red/20 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">{DIFFICULTY_LABELS.insane}</span>}
            </div>

            <h3
                className="text-lg font-bold text-text-bright mb-2 truncate"
                title={quest.title}
            >
                {quest.title}
            </h3>

            <div className="mb-6 flex-1">
                <p className={`text-sm text-text-muted transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {quest.description}
                </p>
                {isLongDescription && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[10px] uppercase tracking-widest text-accent-blue mt-2 hover:text-white font-bold cursor-pointer"
                    >
                        {isExpanded ? QUEST_ACTIONS.showLess : QUEST_ACTIONS.readMore}
                    </button>
                )}
            </div>

            {quest.status === QUEST_STATUS.active && quest.end_time && (
                <div className="flex items-center gap-2 text-accent-orange mb-6 text-xs font-mono bg-accent-orange/5 p-2 rounded">
                    <Clock size={14} />
                    <span>Due: {new Date(quest.end_time).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            )}

            <div className="flex flex-col gap-2 mt-auto">
                {quest.status === QUEST_STATUS.created && (
                    <>
                        {isStarting ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 bg-accent-blue/5 p-4 rounded border border-accent-blue/20 mb-2 overflow-hidden"
                            >
                                <label className="text-[10px] font-bold uppercase tracking-widest text-accent-blue block mb-1">
                                    Quest Duration
                                </label>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label htmlFor={`days-${quest.id}`} className="text-[9px] text-text-muted uppercase">{TIME_LABELS.days}</label>
                                        <input
                                            id={`days-${quest.id}`}
                                            type="number"
                                            value={days}
                                            onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full bg-[#3c3c3c] border-none text-xs py-1.5 px-2"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor={`hours-${quest.id}`} className="text-[9px] text-text-muted uppercase">{TIME_LABELS.hours}</label>
                                        <input
                                            id={`hours-${quest.id}`}
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full bg-[#3c3c3c] border-none text-xs py-1.5 px-2"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor={`mins-${quest.id}`} className="text-[9px] text-text-muted uppercase">{TIME_LABELS.minutes}</label>
                                        <input
                                            id={`mins-${quest.id}`}
                                            type="number"
                                            value={minutes}
                                            onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full bg-[#3c3c3c] border-none text-xs py-1.5 px-2"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleStartConfirm}
                                        className="btn btn-primary text-xs py-1.5 px-4 flex-1"
                                    >{UI_LABELS.confirm}</button>
                                    <button
                                        onClick={() => setIsStarting(false)}
                                        className="btn btn-ghost text-xs py-1.5 px-4 bg-white/5 opacity-60 hover:opacity-100"
                                    >{UI_LABELS.cancel}</button>
                                </div>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setIsStarting(true)}
                                className="btn btn-primary flex-1 justify-center gap-2 cursor-pointer"
                            >
                                <Play size={14} /> {QUEST_ACTIONS.start}
                            </button>
                        )}
                    </>
                )}
                {quest.status === QUEST_STATUS.active && (
                    <button
                        onClick={() => onAction(quest.id, 'complete')}
                        className="btn btn-primary flex-1 justify-center gap-2 bg-accent-green hover:bg-accent-green/80 border-none cursor-pointer"
                    >
                        <CheckCircle size={14} /> {QUEST_ACTIONS.complete}
                    </button>
                )}
                {quest.status === QUEST_STATUS.completed && (
                    <Link
                        to={`/achievements?quest_id=${quest.id}`}
                        className="btn btn-outline flex-1 justify-center gap-2 border-accent-green/30 text-accent-green hover:bg-accent-green/5 no-underline"
                    >
                        <Award size={14} /> {QUEST_ACTIONS.viewReward}
                    </Link>
                )}
                {quest.status === QUEST_STATUS.failed && (
                    <button
                        onClick={() => onAction(quest.id, 'restart')}
                        className="btn btn-outline flex-1 justify-center gap-2 border-accent-red/30 text-accent-red hover:bg-accent-red/5 cursor-pointer"
                    >
                        <RefreshCcw size={14} /> {QUEST_ACTIONS.restart}
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
    const [newQuest, setNewQuest] = useState({ title: '', description: '', planned_achievement_name: '', difficulty: 'medium' });

    const sortQuests = (questList) => {
        const priority = {
            [QUEST_STATUS.active]: 1,
            [QUEST_STATUS.created]: 2,
            [QUEST_STATUS.failed]: 3,
            [QUEST_STATUS.completed]: 4
        };

        return [...questList].sort((a, b) => {
            if (priority[a.status] !== priority[b.status]) {
                return priority[a.status] - priority[b.status];
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });
    };

    const fetchQuests = async () => {
        try {
            const res = await api.get('quests/');
            setQuests(sortQuests(res.data));
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
            setQuests(sortQuests([res.data, ...quests]));
            setNewQuest({ title: '', description: '', planned_achievement_name: '', difficulty: DIFFICULTY_LEVELS.medium });
            setShowAddForm(false);
        } catch (err) {
            alert('Error creating quest. Make sure all fields are filled.');
        }
    };

    const handleAction = async (id, action, data = {}) => {
        try {
            await api.post(`quests/${id}/${action}/`, data);
        } catch (err) {
            // Even if it failed (e.g. 400 for expired), we refresh to show updated status
            if (err.response?.data?.error) {
                console.warn(`Action ${action} resulted in: ${err.response.data.error}`);
            }
        } finally {
            fetchQuests();
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
                        Active Quests
                    </h1>
                    <p className="text-text-muted mt-1">Manage your journey and track achievements</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'} px-6 py-2.5 rounded-sm`}
                >
                    {showAddForm ? UI_LABELS.cancel : (
                        <>
                            <Plus size={18} />
                            {QUEST_ACTIONS.newQuest}
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
                        <form onSubmit={handleCreate} className="glass-card p-10 border-accent-blue/30 max-w-2xl mx-auto">
                            <div className="space-y-8 mb-10">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="quest-title" className="text-xs font-bold uppercase tracking-widest text-text-muted">{FORM_LABELS.title}</label>
                                        <span className="text-[10px] text-text-muted">{newQuest.title.length}/255</span>
                                    </div>
                                    <input
                                        id="quest-title"
                                        value={newQuest.title}
                                        onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                                        placeholder="E.g. Daily Workout"
                                        className="text-lg py-3"
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="quest-desc" className="text-xs font-bold uppercase tracking-widest text-text-muted">{FORM_LABELS.description}</label>
                                    <textarea
                                        id="quest-desc"
                                        value={newQuest.description}
                                        onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                                        placeholder="Operation details and objectives..."
                                        className="w-full min-h-[120px] bg-[#3c3c3c] border border-transparent focus:border-accent-blue p-4 text-text-main outline-none resize-y"
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="difficulty" className="text-xs font-bold uppercase tracking-widest text-text-muted">{FORM_LABELS.difficulty}</label>
                                    <select
                                        id="difficulty"
                                        value={newQuest.difficulty}
                                        onChange={(e) => setNewQuest({ ...newQuest, difficulty: e.target.value })}
                                        className="w-full bg-[#3c3c3c] border border-transparent focus:border-accent-blue p-3 text-text-main outline-none cursor-pointer"
                                    >
                                        <option value={DIFFICULTY_LEVELS.easy} className="bg-[#2d2d2d] text-[#4ec9b0]">{DIFFICULTY_LABELS.easy} (Bronze Reward)</option>
                                        <option value={DIFFICULTY_LEVELS.medium} className="bg-[#2d2d2d] text-[#4fc1ff]">{DIFFICULTY_LABELS.medium} (Silver Reward)</option>
                                        <option value={DIFFICULTY_LEVELS.hard} className="bg-[#2d2d2d] text-[#ce9178]">{DIFFICULTY_LABELS.hard} (Gold Reward)</option>
                                        <option value={DIFFICULTY_LEVELS.insane} className="bg-[#2d2d2d] text-[#f44747]">{DIFFICULTY_LABELS.insane} (Diamond Reward)</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="achievement-name" className="text-xs font-bold uppercase tracking-widest text-text-muted">{FORM_LABELS.rewardName}</label>
                                        <span className="text-[10px] text-text-muted">{newQuest.planned_achievement_name.length}/255</span>
                                    </div>
                                    <input
                                        id="achievement-name"
                                        value={newQuest.planned_achievement_name}
                                        onChange={(e) => setNewQuest({ ...newQuest, planned_achievement_name: e.target.value })}
                                        placeholder="E.g. Master of Cardio"
                                        maxLength={255}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-glass-border">
                                <button type="submit" className="btn btn-primary px-12 py-4 font-bold text-base uppercase tracking-widest">
                                    {QUEST_ACTIONS.deploy}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {quests.length === 0 ? (
                <div className="center-vh h-64 border-2 border-dashed border-glass-border rounded-lg text-text-muted">
                    No active quests. Click "New Quest" to begin.
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
