import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';
import api from '../api';
import { DIFFICULTY_LEVELS, ERROR_MESSAGES, FORM_LABELS, QUEST_ACTIONS, QUEST_STATUS, UI_LABELS } from '../constants';

// Mock the API module
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

describe('Quest Creation Form', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockResolvedValue({ data: [] });
    });

    const waitForLoading = async () => {
        await waitFor(() => expect(screen.queryByText(new RegExp(UI_LABELS.loading, 'i'))).not.toBeInTheDocument());
    };

    it('updates character counters as user types', async () => {
        renderWithRouter(<Dashboard />);
        await waitForLoading();
        // Open form
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.newQuest, 'i') }));

        const titleInput = screen.getByLabelText(new RegExp(FORM_LABELS.title, 'i'));
        fireEvent.change(titleInput, { target: { value: 'My New Quest' } });

        // Counter for title: 12/255
        expect(screen.getByText('12/255')).toBeInTheDocument();
    });

    it('changes difficulty selection', async () => {
        renderWithRouter(<Dashboard />);
        await waitForLoading();
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.newQuest, 'i') }));

        const select = screen.getByLabelText(new RegExp(FORM_LABELS.difficulty, 'i'));
        fireEvent.change(select, { target: { value: DIFFICULTY_LEVELS.insane } });

        expect(select.value).toBe(DIFFICULTY_LEVELS.insane);
    });

    it('submits form and clears inputs on success', async () => {
        api.post.mockResolvedValue({
            data: {
                id: 123,
                title: 'Success Quest',
                description: 'D',
                status: QUEST_STATUS.created,
                difficulty: DIFFICULTY_LEVELS.medium,
                planned_achievement_name: 'P'
            }
        });

        renderWithRouter(<Dashboard />);
        await waitForLoading();
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.newQuest, 'i') }));

        fireEvent.change(screen.getByLabelText(new RegExp(FORM_LABELS.title, 'i')), { target: { value: 'Success Quest' } });
        fireEvent.change(screen.getByLabelText(new RegExp(FORM_LABELS.rewardName, 'i')), { target: { value: 'Achievement' } });
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.deploy, 'i') }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('quests/', expect.objectContaining({
                title: 'Success Quest'
            }));
        });

        // Form should be closed (wait for animation)
        await waitFor(() => {
            expect(screen.queryByLabelText(new RegExp(FORM_LABELS.title, 'i'))).not.toBeInTheDocument();
        });
    });

    it('shows alert on submission failure', async () => {
        const spy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        api.post.mockRejectedValue(new Error('API Error'));

        renderWithRouter(<Dashboard />);
        await waitForLoading();
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.newQuest, 'i') }));

        fireEvent.change(screen.getByLabelText(new RegExp(FORM_LABELS.title, 'i')), { target: { value: 'Fail Quest' } });
        fireEvent.change(screen.getByLabelText(new RegExp(FORM_LABELS.rewardName, 'i')), { target: { value: 'Achievement' } });
        fireEvent.click(screen.getByRole('button', { name: new RegExp(QUEST_ACTIONS.deploy, 'i') }));

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith(expect.stringContaining(ERROR_MESSAGES.createQuest));
        });
        spy.mockRestore();
    });
});
