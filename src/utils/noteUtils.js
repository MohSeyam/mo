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

export function filterNotes(notes, search, tagFilters) {
    return notes.filter(note => {
        // البحث في العنوان، المحتوى، التاجات، اسم ووصف المهمة
        const searchLower = search ? search.toLowerCase() : '';
        const matchesSearch = !search ||
            (note.title && note.title.toLowerCase().includes(searchLower)) ||
            (note.content && note.content.toLowerCase().includes(searchLower)) ||
            (note.keywords && note.keywords.some(tag => tag.toLowerCase().includes(searchLower))) ||
            (note.taskData && (
                (note.taskData.title && note.taskData.title.toLowerCase().includes(searchLower)) ||
                (note.taskData.description && note.taskData.description.toLowerCase().includes(searchLower))
            ));
        // التصفية المتعددة للتاجات
        const matchesTags = !tagFilters || tagFilters.length === 0 ||
            (note.keywords && note.keywords.some(tag => tagFilters.includes(tag)));
        return matchesSearch && matchesTags;
    });
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

export function getTopTags(notes, topN = 3) {
    const tagCount = {};
    notes.forEach(note => {
        (note.keywords || []).forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([tag, count]) => ({ tag, count }));
}

export function getStats(notes, journalEntries) {
    return {
        notesCount: notes.length,
        journalCount: journalEntries.length,
        topTags: getTopTags(notes)
    };
}

export function exportNoteAsMarkdown(note, lang = 'ar') {
    let md = `# ${note.title}\n`;
    if (note.keywords && note.keywords.length)
        md += `\n**Tags:** ${note.keywords.join(', ')}\n`;
    if (note.taskData && note.taskData.title)
        md += `\n**Task:** ${note.taskData.title[lang] || note.taskData.title}\n`;
    md += `\n---\n`;
    md += note.content;
    return md;
}

export function exportAllData(appState) {
    return JSON.stringify(appState, null, 2);
}

export function importAllData(currentState, importedData) {
    // دمج الملاحظات والتدوينات مع تجنب التكرار (حسب updatedAt أو id)
    const merged = JSON.parse(JSON.stringify(currentState));
    // دمج الملاحظات
    if (importedData.notes) {
        merged.notes = merged.notes || {};
        Object.keys(importedData.notes).forEach(weekKey => {
            merged.notes[weekKey] = merged.notes[weekKey] || { days: {} };
            Object.keys(importedData.notes[weekKey].days).forEach(dayIdx => {
                merged.notes[weekKey].days[dayIdx] = merged.notes[weekKey].days[dayIdx] || {};
                Object.keys(importedData.notes[weekKey].days[dayIdx]).forEach(taskId => {
                    // إذا لم توجد أو كانت الملاحظة المستوردة أحدث
                    const importedNote = importedData.notes[weekKey].days[dayIdx][taskId];
                    const existingNote = merged.notes[weekKey].days[dayIdx][taskId];
                    if (!existingNote || new Date(importedNote.updatedAt) > new Date(existingNote.updatedAt)) {
                        merged.notes[weekKey].days[dayIdx][taskId] = importedNote;
                    }
                });
            });
        });
    }
    // دمج التدوينات
    if (importedData.journal) {
        merged.journal = merged.journal || {};
        Object.keys(importedData.journal).forEach(weekKey => {
            merged.journal[weekKey] = merged.journal[weekKey] || { days: {} };
            Object.keys(importedData.journal[weekKey].days).forEach(dayIdx => {
                const importedEntry = importedData.journal[weekKey].days[dayIdx];
                const existingEntry = merged.journal[weekKey].days[dayIdx];
                if (!existingEntry || new Date(importedEntry.updatedAt) > new Date(existingEntry.updatedAt)) {
                    merged.journal[weekKey].days[dayIdx] = importedEntry;
                }
            });
        });
    }
    return merged;
}