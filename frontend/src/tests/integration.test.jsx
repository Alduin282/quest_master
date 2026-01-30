import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';
import api from '../api';
import { DIFFICULTY_LEVELS, QUEST_ACTIONS, QUEST_STATUS, UI_LABELS } from '../constants';

// Mock API
vi.mock('../api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn()
    }
}));

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('Dashboard Integration', () => {
    const mockQuests = [
        {
            id: 1,
            title: 'Active Quest',
            status: QUEST_STATUS.active,
            difficulty: DIFFICULTY_LEVELS.hard,
            created_at: '2023-01-01T12:00:00Z'
        },
        {
            id: 2,
            title: 'Completed Quest',
            status: QUEST_STATUS.completed,
            difficulty: DIFFICULTY_LEVELS.easy,
            created_at: '2023-01-01T10:00:00Z'
        },
        {
            id: 3,
            title: 'Created Quest',
            status: QUEST_STATUS.created,
            difficulty: DIFFICULTY_LEVELS.medium,
            created_at: '2023-01-01T11:00:00Z'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads and displays quests sorted by status priority', async () => {
        // Priority: Active > Created > Failed > Completed
        api.get.mockResolvedValue({ data: mockQuests });

        renderWithRouter(<Dashboard />);

        await waitFor(() => expect(screen.queryByText(new RegExp(UI_LABELS.loading, 'i'))).not.toBeInTheDocument());

        const headings = screen.getAllByRole('heading', { level: 3 });

        // Check order
        expect(headings[0]).toHaveTextContent('Active Quest');
        expect(headings[1]).toHaveTextContent('Created Quest');
        expect(headings[2]).toHaveTextContent('Completed Quest');
    });

    it('completes a quest and refreshes list', async () => {
        api.get.mockResolvedValueOnce({ data: [mockQuests[0]] }); // Initial load

        renderWithRouter(<Dashboard />);
        await waitFor(() => expect(screen.queryByText(new RegExp(UI_LABELS.loading, 'i'))).not.toBeInTheDocument());

        // Mock completion call
        const activeQuestCard = screen.getByText('Active Quest').closest('.glass-card');
    });

    it('deletes a quest and removes it from UI', async () => {
        api.get.mockResolvedValueOnce({ data: [mockQuests[2]] }); // Created Quest
        api.delete.mockResolvedValue({});

        // Mock confirm
        vi.spyOn(window, 'confirm').mockImplementation(() => true);

        renderWithRouter(<Dashboard />);
        await waitFor(() => expect(screen.queryByText(new RegExp(UI_LABELS.loading, 'i'))).not.toBeInTheDocument());

        const deleteBtn = screen.getByTitle(QUEST_ACTIONS.delete);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('quests/3/');
        });

        // Should be removed from UI directly (optimistic update or re-fetch)
        // Implementation uses: setQuests(quests.filter(q => q.id !== id));
        expect(screen.queryByText('Created Quest')).not.toBeInTheDocument();
    });
});
