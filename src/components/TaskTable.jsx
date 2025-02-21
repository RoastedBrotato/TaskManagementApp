/**
 * TaskTable Component
 * 
 * A comprehensive table component for managing tasks with features including:
 * - CRUD operations for tasks
 * - Sorting and filtering
 * - Pagination
 * - Custom fields management
 * - Bulk actions
 * - Undo/Redo functionality
 * 
 * @component
 */
import { useEffect, useState } from "react";
import useTaskStore from "../store/useTaskStore";
import TaskModal from "./TaskModal";
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { getStoredTasks, setStoredTasks } from '../utils/localStorage';
import CustomFieldsModal from './CustomFieldsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

const TaskTable = () => {
  // State management for tasks and UI
  const { tasks, setTasks } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    title: '',
    priority: 'all',
    status: 'all'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10
  });

  // Custom fields and history management
  const [customFields, setCustomFields] = useState([]);
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedTasks, setSelectedTasks] = useState([]);

  /**
   * Initial data loading effect
   * Loads tasks from localStorage or fetches from API if not available
   */
  useEffect(() => {
    const storedTasks = getStoredTasks();
    if (storedTasks.length > 0) {
      setTasks(storedTasks);
      // Initialize history with stored tasks
      setHistory([storedTasks]);
      setHistoryIndex(0);
    } else {
      // Fetch from API only if localStorage is empty
      const fetchTasks = async () => {
        try {
          const response = await fetch(
            "https://gist.githubusercontent.com/yangshun/7acbe005af922e43a26dea8109e16aed/raw"
          );
          const data = await response.json();
          setTasks(data);
          setStoredTasks(data);
          // Initialize history with API data
          setHistory([data]);
          setHistoryIndex(0);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        }
      };
      fetchTasks();
    }
  }, [setTasks]);

  /**
   * Updates localStorage when tasks change
   */
  useEffect(() => {
    setStoredTasks(tasks);
  }, [tasks]);

  /**
   * Adds a new state to the history stack for undo/redo functionality
   * @param {Array} newTasks - The new tasks state to add to history
   */
  const addToHistory = (newTasks) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTasks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  /**
   * Handles the undo operation
   * Reverts to the previous state in history
   */
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTasks(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTasks(history[historyIndex + 1]);
    }
  };

  const handleCreateTask = (newTask) => {
    const task = {
      ...newTask,
      id: Date.now(), // Simple ID generation
    };
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    addToHistory(newTasks);
    toast.success('Task created successfully!', {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const handleEditTask = (updatedTask) => {
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(newTasks);
    addToHistory(newTasks);
    toast.success('Task updated successfully!', {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newTasks = tasks.filter(task => task.id !== taskId);
      setTasks(newTasks);
      addToHistory(newTasks);
      toast.success('Task deleted successfully!', {
        duration: 2000,
        position: 'bottom-right',
        icon: '🗑️',
      });
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleCustomFieldsSave = (fields) => {
    setCustomFields(fields);
    // Update all existing tasks with new fields
    const updatedTasks = tasks.map(task => {
      const newTask = { ...task };
      fields.forEach(field => {
        if (!(field.name in newTask)) {
          newTask[field.name] = field.type === 'checkbox' ? false :
                               field.type === 'number' ? 0 : '';
        }
      });
      return newTask;
    });
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTitle = task.title.toLowerCase().includes(filters.title.toLowerCase());
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    return matchesTitle && matchesPriority && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedTasks = sortedTasks.slice(
    (pagination.currentPage - 1) * pagination.pageSize,
    pagination.currentPage * pagination.pageSize
  );

  const totalPages = Math.ceil(sortedTasks.length / pagination.pageSize);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <FaSort className="inline ml-1" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="inline ml-1" /> : 
      <FaSortDown className="inline ml-1" />;
  };

  const Pagination = () => (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-[#6b7280] gap-4">
      <div className="flex items-center gap-2">
        <span>Items per page:</span>
        <select
          className="px-2 py-1 bg-[#f7f6f3] border border-[#e6e6e6] rounded"
          value={pagination.pageSize}
          onChange={(e) => setPagination({ ...pagination, currentPage: 1, pageSize: Number(e.target.value) })}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={pagination.currentPage === 1}
          className="px-3 py-1 bg-[#f7f6f3] border border-[#e6e6e6] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#eae9e5] text-sm"
        >
          Previous
        </button>
        
        <span className="whitespace-nowrap">Page {pagination.currentPage} of {totalPages}</span>
        
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={pagination.currentPage === totalPages}
          className="px-3 py-1 bg-[#f7f6f3] border border-[#e6e6e6] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#eae9e5] text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );

  /**
   * Keyboard shortcut effect for undo/redo
   * Ctrl+Z for undo, Ctrl+Shift+Z for redo
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (!e.shiftKey) handleUndo();
        else handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    setSelectedTasks([]);
  }, [filters, sortConfig, pagination.currentPage]);

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedTasks(
      e.target.checked ? paginatedTasks.map(task => task.id) : []
    );
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      const newTasks = tasks.filter(task => !selectedTasks.includes(task.id));
      setTasks(newTasks);
      addToHistory(newTasks);
      setSelectedTasks([]);
      toast.success(`${selectedTasks.length} tasks deleted successfully!`, {
        duration: 2000,
        position: 'bottom-right',
        icon: '🗑️',
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#ffffff] text-[#37352f]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Toaster />
        {/* Update the button container */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 sm:justify-between w-full">
          <div className="order-2 sm:order-1 w-full sm:w-auto">
            {selectedTasks.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Selected ({selectedTasks.length})
              </button>
            )}
          </div>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 text-sm sm:text-base"
            >
              <motion.span whileTap={{ scale: 0.95 }}>Undo</motion.span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 text-sm sm:text-base"
            >
              <motion.span whileTap={{ scale: 0.95 }}>Redo</motion.span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 order-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCustomFieldsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#f7f6f3] text-[#37352f] rounded hover:bg-[#eae9e5] transition-colors border border-[#e6e6e6]"
            >
              Manage Fields
            </button>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-[#2eaadc] text-white rounded hover:bg-[#2891b9] transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>
        
        {/* Update filter controls */}
        <div className="mb-6 space-y-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Filter by title..."
              className="w-full px-3 py-2 bg-[#f7f6f3] border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#2eaadc] focus:border-transparent"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
            <select
              className="px-3 py-2 bg-[#f7f6f3] border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#2eaadc] focus:border-transparent"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="none">None</option>
            </select>
            <select
              className="px-3 py-2 bg-[#f7f6f3] border border-[#e6e6e6] rounded focus:outline-none focus:ring-2 focus:ring-[#2eaadc] focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e6e6e6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e6e6e6] bg-[#f7f6f3] whitespace-nowrap">
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#37352f]">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === paginatedTasks.length && paginatedTasks.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700" onClick={() => handleSort('title')}>
                    Title <SortIcon columnKey="title" />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700" onClick={() => handleSort('priority')}>
                    Priority <SortIcon columnKey="priority" />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700" onClick={() => handleSort('status')}>
                    Status <SortIcon columnKey="status" />
                  </th>
                  {customFields.map(field => (
                    <th
                      key={field.id}
                      className="px-6 py-4 text-left font-semibold text-gray-700"
                      onClick={() => handleSort(field.name)}
                    >
                      {field.name} <SortIcon columnKey={field.name} />
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`border-b border-[#e6e6e6] hover:bg-[#f7f6f3] transition-colors whitespace-nowrap ${
                        selectedTasks.includes(task.id) ? 'bg-[#eef4ff]' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleSelectTask(task.id)}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-800">{task.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          task.priority === 'urgent' ? 'bg-[#ffdede] text-[#e11d48]' :
                          task.priority === 'high' ? 'bg-[#fff1e1] text-[#fb923c]' :
                          task.priority === 'medium' ? 'bg-[#fef9c3] text-[#ca8a04]' :
                          'bg-[#dcfce7] text-[#16a34a]'
                        }`}>
                          {task.priority || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          task.status === 'not_started' ? 'bg-[#ffdede] text-[#e11d48]' :
                          task.status === 'in_progress' ? 'bg-[#fef9c3] text-[#ca8a04]' :
                          task.status === 'completed' ? 'bg-[#dcfce7] text-[#16a34a]' :
                          'bg-[#f3f4f6] text-[#6b7280]'
                        }`}>
                          {task.status?.replace('_', ' ').charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      {customFields.map(field => (
                        <td key={field.id} className="px-6 py-4">
                          {field.type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={task[field.name] || false}
                              onChange={() => handleCustomFieldChange(task.id, field.name, !task[field.name])}
                              className="h-4 w-4"
                            />
                          ) : (
                            <span>{task[field.name] || ''}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        <Pagination />
        
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={(task) => {
            editingTask ? handleEditTask(task) : handleCreateTask(task);
          }}
          task={editingTask}
          customFields={customFields} // Add this line
        />

        <CustomFieldsModal
          isOpen={isCustomFieldsModalOpen}
          onClose={() => setIsCustomFieldsModalOpen(false)}
          onSave={handleCustomFieldsSave}
          existingFields={customFields}
        />
      </div>
    </motion.div>
  );
};

export default TaskTable;
