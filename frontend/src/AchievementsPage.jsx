import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from './api';
import { Award, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENT_RARITY_LABELS, QUEST_ACTIONS, UI_LABELS } from './constants';

export const AchievementCard = React.forwardRef(({ achievement, isHighlighted }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRedrawing, setIsRedrawing] = useState(false);
    const [imageUrl, setImageUrl] = useState(achievement.image);
    const [imgError, setImgError] = useState(false);

    const handleRedraw = async () => {
        if (isRedrawing) return;
        setIsRedrawing(true);
        try {
            const res = await api.post(`achievements/${achievement.id}/regenerate_image/`);

            // Add a timestamp to bypass image cache
            const newUrl = `${res.data.image}?t=${new Date().getTime()}`;

            setImgError(false);
            setImageUrl(newUrl);
        } catch (err) {
            alert('Failed to redraw achievement image. Please try again.');
        } finally {
            setIsRedrawing(false);
        }
    };

    const rarityStyles = {
        bronze: {
            border: 'border-l-[#cd7f32]',
            bg: 'bg-[#cd7f32]/5',
            iconColor: 'text-[#cd7f32]',
            label: ACHIEVEMENT_RARITY_LABELS.bronze,
            accent: '#cd7f32'
        },
        silver: {
            border: 'border-l-[#a0a0a0]',
            bg: 'bg-[#a0a0a0]/5',
            iconColor: 'text-[#a0a0a0]',
            label: ACHIEVEMENT_RARITY_LABELS.silver,
            accent: '#a0a0a0'
        },
        gold: {
            border: 'border-l-[#ffd700]',
            bg: 'bg-[#ffd700]/5',
            iconColor: 'text-[#ffd700]',
            label: ACHIEVEMENT_RARITY_LABELS.gold,
            accent: '#ffd700',
            glow: 'shadow-[0_0_15px_rgba(255,215,0,0.2)]'
        },
        diamond: {
            border: 'border-l-[#b9f2ff]',
            bg: 'bg-[#b9f2ff]/5',
            iconColor: 'text-[#b9f2ff]',
            label: ACHIEVEMENT_RARITY_LABELS.diamond,
            accent: '#b9f2ff',
            glow: 'diamond-glow'
        }
    };

    const style = rarityStyles[achievement.rarity] || rarityStyles.silver;

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: 1,
                scale: 1,
                borderColor: isHighlighted ? 'var(--accent-blue)' : 'var(--glass-border)',
                backgroundColor: isHighlighted ? 'rgba(0, 122, 204, 0.1)' : 'var(--glass-bg)'
            }}
            transition={{ duration: 0.5 }}
            className={`glass-card flex items-center gap-8 p-6 border-l-4 transition-all duration-300 ${isHighlighted ? 'ring-2 ring-accent-blue/30 shadow-[0_0_20px_rgba(0,122,204,0.3)]' : style.border} ${style.glow || ''} ${style.pulse || ''}`}
        >
            <div
                className="relative shrink-0"
                style={{
                    width: '120px',
                    height: '120px',
                    padding: '4px',
                    background: `linear-gradient(135deg, ${style.accent}40, ${style.accent}20)`,
                    borderRadius: '8px',
                    border: `3px solid ${style.accent}`,
                    boxShadow: `0 0 20px ${style.accent}30`
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={achievement.name}
                        className={`w-full h-full object-cover rounded transition-opacity duration-300 ${isRedrawing ? 'opacity-30' : 'opacity-100'}`}
                        style={{ display: imgError ? 'none' : 'block' }}
                        onLoad={() => {
                            setImgError(false);
                        }}
                        onError={(e) => {
                            setImgError(true);
                        }}
                    />
                ) : null}
                <div
                    className="w-full h-full bg-bg-tertiary rounded flex items-center justify-center"
                    style={{ display: (!imageUrl || imgError) ? 'flex' : 'none' }}
                >
                    <Award size={48} className={style.iconColor} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2 items-center shrink-0">
                        <button
                            onClick={handleRedraw}
                            disabled={isRedrawing}
                            className={`p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative ${isRedrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Redraw achievement image"
                        >
                            <RefreshCw
                                size={12}
                                className={`text-text-muted group-hover:text-white transition-all ${isRedrawing ? 'animate-spin' : ''}`}
                            />
                        </button>
                        <div className="text-[9px] font-mono whitespace-nowrap uppercase tracking-tighter bg-white/5 opacity-60 px-1.5 py-0.5 rounded">
                            {new Date(achievement.awarded_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black text-text-bright mb-1 truncate" title={achievement.name}>
                    {achievement.name}
                </h3>

                <div className="bg-white/5 p-2 rounded border border-white/5 mt-2">
                    <div className="flex items-center justify-between gap-4">
                        <span
                            className={`text-xs font-bold uppercase tracking-widest truncate flex-1 min-w-0`}
                            style={{ color: style.accent }}
                            title={achievement.quest_title}
                        >
                            {UI_LABELS.questPrefix}{achievement.quest_title}
                        </span>
                        {achievement.quest_description && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[10px] text-text-muted hover:text-white cursor-pointer uppercase font-bold whitespace-nowrap shrink-0"
                            >
                                {isExpanded ? QUEST_ACTIONS.hideDescription : QUEST_ACTIONS.readDescription}
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

                <div
                    className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-80"
                    style={{ color: style.accent }}
                >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.accent }}></span>
                    {style.label}
                </div>
            </div>
        </motion.div>
    );
});

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const highlightQuestId = searchParams.get('quest_id');
    const cardRefs = useRef({});

    const fetchAchievements = async () => {
        try {
            const res = await api.get('achievements/');
            setAchievements(res.data);

            // Allow some time for rendering before scrolling
            if (highlightQuestId) {
                setTimeout(() => {
                    const targetCard = cardRefs.current[highlightQuestId];
                    if (targetCard) {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
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
                            <AchievementCard
                                key={achievement.id}
                                ref={el => cardRefs.current[achievement.quest] = el}
                                achievement={achievement}
                                isHighlighted={String(achievement.quest) === highlightQuestId}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AchievementsPage;
