// Utility functions for extracting and sorting notes and journal entries
export function extractAllTaskNotes(appState, planData) {
    if (!appState || !appState.notes) return [];
    const notesList = [];
    Object.keys(appState.notes).forEach(weekKey => {
        Object.keys(appState.notes[weekKey].days).forEach(dayIdx => {
            const dayNotes = appState.notes[weekKey].days[dayIdx];
            Object.keys(dayNotes).forEach(taskId => {
                const note = dayNotes[taskId];
                const weekData = planData.find(w => w.week === parseInt(weekKey));
                const dayData = weekData?.days[parseInt(dayIdx)];
                const taskData = dayData?.tasks.find(t => t.id === taskId);
                if (weekData && dayData && taskData) {
                    notesList.push({ ...note, weekData, dayData, taskData });
                }
            });
        });
    });
    return notesList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function extractAllJournalEntries(appState, planData) {
    if (!appState || !appState.journal) return [];
    const entriesList = [];
    Object.keys(appState.journal).forEach(weekKey => {
        Object.keys(appState.journal[weekKey].days).forEach(dayIdx => {
            const entry = appState.journal[weekKey].days[dayIdx];
            if(entry) {
                const weekData = planData.find(w => w.week === parseInt(weekKey));
                const dayData = weekData?.days[parseInt(dayIdx)];
                if (weekData && dayData) {
                    entriesList.push({ ...entry, weekData, dayData });
                }
            }
        });
    });
    return entriesList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getAllTags(notes) {
    return Array.from(new Set(notes.flatMap(n => n.keywords || [])));
}

export function filterNotes(notes, search, tagFilter) {
    return notes.filter(note =>
        (!search || note.title.toLowerCase().includes(search.toLowerCase()) || (note.content && note.content.toLowerCase().includes(search.toLowerCase()))) &&
        (!tagFilter || (note.keywords && note.keywords.includes(tagFilter)))
    );
}

export function getAllWeeks(entries) {
    return Array.from(new Set(entries.map(e => e.weekData.week)));
}

export function filterJournalEntries(entries, search, weekFilter) {
    return entries.filter(entry =>
        (!search || (entry.content && entry.content.toLowerCase().includes(search.toLowerCase()))) &&
        (!weekFilter || entry.weekData.week === parseInt(weekFilter))
    );
}