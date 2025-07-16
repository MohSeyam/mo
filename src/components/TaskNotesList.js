import React, { useState, useMemo } from 'react';
import NoteCard from './NoteCard';
import { getAllTags, filterNotes } from '../utils/noteUtils';

function TaskNotesList({ notes, lang, onEdit }) {
  const [search, setSearch] = useState('');
  const [tagFilters, setTagFilters] = useState([]);
  const allTags = useMemo(() => getAllTags(notes), [notes]);
  const filteredNotes = useMemo(() => filterNotes(notes, search, tagFilters), [notes, search, tagFilters]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder={lang === 'ar' ? 'بحث في العنوان أو المحتوى...' : 'Search title or content...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded-md flex-1 dark:bg-gray-700"
        />
        <select
          multiple
          value={tagFilters}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setTagFilters(selected);
          }}
          className="p-2 border rounded-md min-w-[120px] dark:bg-gray-700 h-24"
        >
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <NoteCard key={note.updatedAt} note={note} lang={lang} onClick={() => onEdit(note)} />
        ))}
        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">{lang === 'ar' ? 'لا توجد ملاحظات مطابقة' : 'No matching notes found'}</div>
        )}
      </div>
    </div>
  );
}

export default TaskNotesList;