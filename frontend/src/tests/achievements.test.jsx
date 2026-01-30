import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AchievementCard } from '../AchievementsPage';
import { BrowserRouter } from 'react-router-dom';
import { ACHIEVEMENT_RARITY_LABELS, QUEST_ACTIONS, UI_LABELS } from '../constants';

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('AchievementCard Visuals', () => {
    const mockAchievement = {
        id: 1,
        name: 'Master of React',
        quest_title: 'Build a great app',
        quest_description: 'Detail about the app',
        awarded_at: new Date().toISOString(),
        rarity: 'gold'
    };

    it('renders achievement name and quest title', () => {
        renderWithRouter(<AchievementCard achievement={mockAchievement} />);
        expect(screen.getByText('Master of React')).toBeInTheDocument();
        expect(screen.getByText(`${UI_LABELS.questPrefix}Build a great app`)).toBeInTheDocument();
    });

    it('displays the formatted awarded date', () => {
        const date = new Date('2023-10-15T09:00:00Z');
        const achievementWithDate = { ...mockAchievement, awarded_at: date.toISOString() };
        renderWithRouter(<AchievementCard achievement={achievementWithDate} />);

        // Exact format depends on locale, but checking for core parts is safer
        // Expecting something like "Oct 15, 2023" or similar
        const dateElement = screen.getByText((content) => {
            return content.includes('2023') && (content.includes('Oct 15') || content.includes('15 Oct'));
        });
        expect(dateElement).toBeInTheDocument();
    });

    it.each([
        ['bronze', ACHIEVEMENT_RARITY_LABELS.bronze, 'border-l-[#cd7f32]'],
        ['silver', ACHIEVEMENT_RARITY_LABELS.silver, 'border-l-accent-blue'],
        ['gold', ACHIEVEMENT_RARITY_LABELS.gold, 'border-l-[#ffd700]'],
        ['diamond', ACHIEVEMENT_RARITY_LABELS.diamond, 'border-l-[#b9f2ff]']
    ])('displays correct label and style for %s rarity', (rarity, label, borderClass) => {
        const achievement = { ...mockAchievement, rarity };
        renderWithRouter(<AchievementCard achievement={achievement} />);

        expect(screen.getByText(label)).toBeInTheDocument();
        const card = screen.getByText('Master of React').closest('.glass-card');
        expect(card).toHaveClass(borderClass);
    });
});

describe('AchievementCard Expansion', () => {
    const mockAchievement = {
        id: 1,
        name: 'Discoverer',
        quest_title: 'Explore the codebase',
        quest_description: 'Found all hidden gems in the code.',
        awarded_at: new Date().toISOString(),
        rarity: 'bronze'
    };

    it('shows "Read description" button', () => {
        renderWithRouter(<AchievementCard achievement={mockAchievement} />);
        expect(screen.getByText(QUEST_ACTIONS.readDescription)).toBeInTheDocument();
    });

    it('toggles quest description on click', () => {
        renderWithRouter(<AchievementCard achievement={mockAchievement} />);
        const toggle = screen.getByText(QUEST_ACTIONS.readDescription);

        fireEvent.click(toggle);
        expect(screen.getByText('Found all hidden gems in the code.')).toBeInTheDocument();
        expect(screen.getByText(QUEST_ACTIONS.hideDescription)).toBeInTheDocument();

        fireEvent.click(screen.getByText(QUEST_ACTIONS.hideDescription));
        // AnimatePresence might keep the text in DOM for a bit, 
        // but the toggle button should flip back immediately.
        expect(screen.getByText(QUEST_ACTIONS.readDescription)).toBeInTheDocument();
    });
});


describe('AchievementCard Highlighting', () => {
    const mockAchievement = {
        id: 1,
        name: 'Target',
        quest_title: 'Focus',
        awarded_at: new Date().toISOString(),
        rarity: 'silver'
    };

    it('applies highlighting styles when isHighlighted is true', () => {
        renderWithRouter(<AchievementCard achievement={mockAchievement} isHighlighted={true} />);
        const card = screen.getByText('Target').closest('.glass-card');

        // Highlight logic in code: ring-2 ring-accent-blue/30
        expect(card).toHaveClass('ring-2');
    });
});
