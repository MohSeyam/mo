import React, { useState, useMemo } from 'react';
import NoteCard from './NoteCard';
import { getAllTags, filterNotes } from '../utils/noteUtils';
import { FixedSizeList as List } from 'react-window';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function TaskNotesList({ notes, lang, onEdit, onReorder }) {
  const [search, setSearch] = useState('');
  const [tagFilters, setTagFilters] = useState([]);
  const [templateTypeFilter, setTemplateTypeFilter] = useState('all');
  const allTags = useMemo(() => getAllTags(notes), [notes]);
  const templateTypeOptions = [
    { value: 'all', label: 'كل الأنواع' },
    { value: 'cyber', label: 'سيبراني' },
    { value: 'policy', label: 'سياسة أمنية' },
    { value: 'soft', label: 'مهارة ناعمة' },
    { value: 'general', label: 'عام' },
  ];
  const filteredNotes = useMemo(() => {
    let base = filterNotes(notes, search, tagFilters);
    if (templateTypeFilter !== 'all') {
      base = base.filter(n => n.templateType === templateTypeFilter);
    }
    return base;
  }, [notes, search, tagFilters, templateTypeFilter]);

  const Row = ({ index, style }) => (
    <div style={style} className="pr-2 pb-4">
      <NoteCard note={filteredNotes[index]} lang={lang} onClick={() => onEdit(filteredNotes[index])} />
    </div>
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(filteredNotes);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    if (onReorder) onReorder(reordered);
  };

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
        <select
          value={templateTypeFilter}
          onChange={e => setTemplateTypeFilter(e.target.value)}
          className="p-2 border rounded-md min-w-[120px] dark:bg-gray-700"
        >
          {templateTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {filteredNotes.length > 30 ? (
        <List
          height={600}
          itemCount={filteredNotes.length}
          itemSize={180}
          width={"100%"}
        >
          {Row}
        </List>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="notes-list" direction="vertical">
            {(provided) => (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredNotes.map((note, idx) => (
                  <Draggable key={note.updatedAt} draggableId={note.updatedAt} index={idx}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <NoteCard note={note} lang={lang} onClick={() => onEdit(note)} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {filteredNotes.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-8">{lang === 'ar' ? 'لا توجد ملاحظات مطابقة' : 'No matching notes found'}</div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

export default TaskNotesList;