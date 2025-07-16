// Utility for updating a journal entry in app state
export function updateJournalEntry(prev, weekId, dayIndex, newContent) {
    const newState = JSON.parse(JSON.stringify(prev));
    newState.journal[weekId].days[dayIndex] = {
        content: newContent,
        updatedAt: new Date().toISOString()
    };
    return newState;
}

export function updateNoteInState(prev, planData, note, newNoteData) {
    const newState = JSON.parse(JSON.stringify(prev));
    const dayIndex = planData.find(w => w.week === note.weekData.week).days.findIndex(d => d.key === note.dayData.key);
    newState.notes[note.weekData.week].days[dayIndex][note.taskData.id] = { ...newNoteData, updatedAt: new Date().toISOString() };
    return newState;
}

export function deleteNoteInState(prev, planData, note) {
    const newState = JSON.parse(JSON.stringify(prev));
    const dayIndex = planData.find(w => w.week === note.weekData.week).days.findIndex(d => d.key === note.dayData.key);
    delete newState.notes[note.weekData.week].days[dayIndex][note.taskData.id];
    return newState;
}