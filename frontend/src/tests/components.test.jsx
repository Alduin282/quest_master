import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatusBadge, QuestCard } from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';
import { DIFFICULTY_LABELS, QUEST_ACTIONS, QUEST_STATUS, TIME_LABELS, UI_LABELS, DIFFICULTY_LEVELS } from '../constants';

// Wrapper for components needing Router
const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('StatusBadge', () => {
    it('renders correct text for active status', () => {
        render(<StatusBadge status={QUEST_STATUS.active} />);
        expect(screen.getByText(new RegExp(QUEST_STATUS.active, 'i'))).toBeInTheDocument();
    });

    it('renders correct text for failed status', () => {
        render(<StatusBadge status={QUEST_STATUS.failed} />);
        expect(screen.getByText(new RegExp(QUEST_STATUS.failed, 'i'))).toBeInTheDocument();
    });
});

describe('QuestCard Visuals', () => {
    const mockQuest = {
        id: 1,
        title: 'Test Quest',
        description: 'Test Description',
        status: QUEST_STATUS.created,
        difficulty: DIFFICULTY_LEVELS.hard
    };

    it('displays quest title and description', () => {
        renderWithRouter(<QuestCard quest={mockQuest} />);
        expect(screen.getByText('Test Quest')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it.each([
        [DIFFICULTY_LEVELS.easy, DIFFICULTY_LABELS.easy],
        [DIFFICULTY_LEVELS.medium, DIFFICULTY_LABELS.medium],
        [DIFFICULTY_LEVELS.hard, DIFFICULTY_LABELS.hard],
        [DIFFICULTY_LEVELS.insane, DIFFICULTY_LABELS.insane]
    ])('displays the correct difficulty badge for %s', (difficulty, label) => {
        const quest = { ...mockQuest, difficulty };
        renderWithRouter(<QuestCard quest={quest} />);
        expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('displays the delete button with correct title', () => {
        renderWithRouter(<QuestCard quest={mockQuest} />);
        const deleteBtn = screen.getByTitle(QUEST_ACTIONS.delete);
        expect(deleteBtn).toBeInTheDocument();
    });

    it('displays "Start Quest" button when status is created', () => {
        renderWithRouter(<QuestCard quest={mockQuest} />);
        expect(screen.getByText(QUEST_ACTIONS.start)).toBeInTheDocument();
    });

    it('displays "View Reward" button when status is completed', () => {
        const completedQuest = { ...mockQuest, status: QUEST_STATUS.completed };
        renderWithRouter(<QuestCard quest={completedQuest} />);
        expect(screen.getByText(QUEST_ACTIONS.viewReward)).toBeInTheDocument();
    });

    it('displays "Restart Quest" button when status is failed', () => {
        const failedQuest = { ...mockQuest, status: QUEST_STATUS.failed };
        renderWithRouter(<QuestCard quest={failedQuest} />);
        expect(screen.getByText(QUEST_ACTIONS.restart)).toBeInTheDocument();
    });

    it('applies truncation class to the title', () => {
        renderWithRouter(<QuestCard quest={mockQuest} />);
        const title = screen.getByText('Test Quest');
        expect(title).toHaveClass('truncate');
    });

    it('calculates total minutes correctly on start confirm', () => {
        const onAction = vi.fn();
        renderWithRouter(<QuestCard quest={mockQuest} onAction={onAction} />);

        // Open modal
        fireEvent.click(screen.getByText(QUEST_ACTIONS.start));

        // Fill inputs
        // Fill inputs
        const daysInput = screen.getByLabelText(new RegExp(TIME_LABELS.days, 'i'));
        const hoursInput = screen.getByLabelText(new RegExp(TIME_LABELS.hours, 'i'));
        const minutesInput = screen.getByLabelText(new RegExp(TIME_LABELS.minutes, 'i'));

        fireEvent.change(daysInput, { target: { value: '1' } });    // 1440
        fireEvent.change(hoursInput, { target: { value: '2' } });   // 120
        fireEvent.change(minutesInput, { target: { value: '30' } }); // 30

        // Total should be 1590
        fireEvent.click(screen.getByText(new RegExp(UI_LABELS.confirm + '$', 'i')));

        expect(onAction).toHaveBeenCalledWith(mockQuest.id, 'start', { duration_minutes: 1590 });
    });
});

describe('QuestCard Expansion', () => {
    const longDescription = 'A'.repeat(150);
    const longQuest = {
        id: 2,
        title: 'Long Quest',
        description: longDescription,
        status: QUEST_STATUS.created,
        difficulty: DIFFICULTY_LEVELS.easy
    };

    it('shows "Read more" for long descriptions', () => {
        renderWithRouter(<QuestCard quest={longQuest} />);
        expect(screen.getByText(QUEST_ACTIONS.readMore)).toBeInTheDocument();
    });

    it('toggles description expansion on click', () => {
        renderWithRouter(<QuestCard quest={longQuest} />);
        const button = screen.getByText(QUEST_ACTIONS.readMore);

        fireEvent.click(button);
        expect(screen.getByText(QUEST_ACTIONS.showLess)).toBeInTheDocument();

        fireEvent.click(screen.getByText(QUEST_ACTIONS.showLess));
        expect(screen.getByText(QUEST_ACTIONS.readMore)).toBeInTheDocument();
    });
});
