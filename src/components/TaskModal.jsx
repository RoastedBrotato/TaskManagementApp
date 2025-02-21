/**
 * TaskModal Component
 * 
 * Modal component for creating and editing tasks.
 * Supports both standard and custom fields.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onSave - Handler for saving task changes
 * @param {Object} props.task - Task data for editing (null for create mode)
 * @param {Array} props.customFields - Custom fields configuration
 */

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TaskModal = ({ isOpen, onClose, onSave, task, customFields }) => {
  const [formData, setFormData] = useState(task || { title: '', priority: 'none', status: 'not_started' });
  const modalRef = useRef(null);

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex sm:items-center justify-center"
          onClick={handleClickOutside}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="w-full sm:w-[500px] p-5 border shadow-lg rounded-t-2xl sm:rounded-lg bg-white"
            style={{
              position: window.innerWidth >= 640 ? 'relative' : 'fixed',
              bottom: window.innerWidth >= 640 ? 'auto' : 0,
              maxHeight: window.innerWidth >= 640 ? '85vh' : '90vh',
              overflowY: "auto"
            }}
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {task ? 'Edit Task' : 'Create New Task'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {customFields.map(field => (
                  <div key={field.id} className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {field.name}
                    </label>
                    {field.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                        className="h-4 w-4"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {task ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;