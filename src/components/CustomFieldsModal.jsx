/**
 * CustomFieldsModal Component
 * 
 * Modal component for managing custom fields in the task management system.
 * Allows users to add, remove, and configure custom fields for tasks.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onSave - Handler for saving field changes
 * @param {Array} props.existingFields - Current custom fields
 */

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const CustomFieldsModal = ({ isOpen, onClose, onSave, existingFields }) => {
  const [fields, setFields] = useState(existingFields || []);
  const [newField, setNewField] = useState({ name: '', type: 'text' });
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  const validateFieldName = (name) => {
    if (!name) return 'Field name is required';
    if (name.length < 2) return 'Field name must be at least 2 characters';
    if (fields.some(field => field.name.toLowerCase() === name.toLowerCase())) {
      return 'Field name must be unique';
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      return 'Field name must start with a letter and contain only letters, numbers, and underscores';
    }
    return '';
  };

  const handleAddField = () => {
    const validationError = validateFieldName(newField.name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFields([...fields, { ...newField, id: Date.now() }]);
    setNewField({ name: '', type: 'text' });
    setError('');
  };

  const handleRemoveField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
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
                Manage Custom Fields
              </h3>
              <div className="mb-4">
                <div className="grid grid-cols-[1fr,auto,auto] items-center gap-3 mb-2">
                  <input
                    type="text"
                    placeholder="Field name"
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <button
                    onClick={handleAddField}
                    className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <div className="mb-4 max-h-60 overflow-y-auto">
                {fields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <span className="font-medium">{field.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({field.type})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveField(field.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomFieldsModal;