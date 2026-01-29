import React, { useState, useEffect } from 'react';
import api from './api';
import { Award, Trophy, Star, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementCard = ({ achievement }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const iconSize = 48;
    const icons = {
        'Quest Started': <Zap size={iconSize} className="text-accent-blue" />,
        'First Step': <Star size={iconSize} className="text-accent-orange" />,
        'Quest Master': <Trophy size={iconSize} className="text-accent-purple" />,
        'Legendary Status': <Shield size={iconSize} className="text-accent-red" />
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card flex items-center gap-8 p-6 border-l-4 border-l-accent-blue transition-all duration-300"
        >
            <div className="bg-bg-tertiary p-5 rounded-sm border border-glass-border shrink-0 flex items-center justify-center">
                {icons[achievement.name] || <Award size={iconSize} className="text-accent-blue" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-text-bright mb-1 truncate" title={achievement.name}>
                        {achievement.name}
                    </h3>
                    <div className="text-[9px] font-mono text-accent-blue uppercase tracking-tighter bg-accent-blue/5 px-1.5 py-0.5 rounded shrink-0">
                        {new Date(achievement.awarded_at).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                <div className="bg-white/5 p-2 rounded border border-white/5 mt-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-accent-blue/80 uppercase tracking-widest truncate">
                            Mission: {achievement.quest_title}
                        </span>
                        {achievement.quest_description && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[10px] text-text-muted hover:text-white cursor-pointer uppercase font-bold"
                            >
                                {isExpanded ? 'Hide briefing' : 'Read briefing'}
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-xs text-text-muted mt-3 italic leading-relaxed pt-2 border-t border-white/5">
                                    {achievement.quest_description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-text-muted uppercase tracking-widest">
                    <span className="w-1 h-1 bg-accent-blue rounded-full"></span>
                    Verified Achievement
                </div>
            </div>
        </motion.div>
    );
};

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            const res = await api.get('achievements/');
            setAchievements(res.data);
        } catch (err) {
            console.error('Failed to fetch achievements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    if (loading) return <div className="center-vh text-text-muted">Loading achievements...</div>;

    return (
        <div className="animate-fade">
            <div className="mb-12">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Award className="text-accent-blue" size={32} />
                    Hall of Fame
                </h1>
                <p className="text-text-muted mt-1">Your journey's milestones and legendary feats</p>
            </div>

            {achievements.length === 0 ? (
                <div className="center-vh h-64 border-2 border-dashed border-glass-border rounded-lg text-text-muted flex-col gap-4">
                    <Award size={48} className="opacity-20" />
                    <p>Your trophy cabinet is empty. Time to start some quests!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {achievements.map(achievement => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AchievementsPage;
