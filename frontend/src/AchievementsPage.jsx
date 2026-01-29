import React, { useState, useEffect } from 'react';
import api from './api';
import { Award, Trophy, Star, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AchievementCard = ({ achievement }) => {
    const icons = {
        'Quest Started': <Zap className="text-accent-blue" />,
        'First Step': <Star className="text-accent-orange" />,
        'Quest Master': <Trophy className="text-accent-purple" />,
        'Legendary Status': <Shield className="text-accent-red" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card flex items-center gap-6 p-6 border-l-4 border-l-accent-blue"
        >
            <div className="bg-bg-tertiary p-4 rounded-full border border-glass-border">
                {icons[achievement.name] || <Award size={32} className="text-accent-blue" />}
            </div>
            <div>
                <h3 className="text-xl font-black text-text-bright mb-1">{achievement.name}</h3>
                <p className="text-sm text-text-muted">{achievement.description || 'Achievement unlocked through dedication and hard work.'}</p>
                <div className="mt-3 text-[10px] font-mono text-accent-blue uppercase tracking-widest bg-accent-blue/5 inline-block px-2 py-0.5 rounded">
                    Awarded: {new Date(achievement.awarded_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
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
