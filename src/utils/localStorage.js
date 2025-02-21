/**
 * localStorage Utilities
 * 
 * Utility functions for managing task persistence in localStorage.
 * 
 * @module LocalStorageUtils
 */

const STORAGE_KEY = 'tasks';

/**
 * Retrieves stored tasks from localStorage
 * @returns {Array} Array of stored tasks or empty array if none found
 */
export const getStoredTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving tasks from localStorage:', error);
    return [];
  }
};

/**
 * Stores tasks in localStorage
 * @param {Array} tasks - Tasks to store
 */
export const setStoredTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error storing tasks in localStorage:', error);
  }
};