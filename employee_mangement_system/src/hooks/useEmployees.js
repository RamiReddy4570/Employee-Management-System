import { useState, useEffect } from 'react';
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById
} from '../services/githubEmployeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new employee
  const createEmployee = async (employeeData) => {
    try {
      setLoading(true);
      setError(null);
      const newEmployee = await addEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError(err.message);
      console.error('Error creating employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update employee
  const modifyEmployee = async (id, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEmployee = await updateEmployee(id, updatedData);
      setEmployees(prev =>
        prev.map(emp => (emp.id === id ? updatedEmployee : emp))
      );
      return updatedEmployee;
    } catch (err) {
      setError(err.message);
      console.error('Error updating employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const removeEmployee = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single employee
  const getEmployee = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const employee = await getEmployeeById(id);
      return employee;
    } catch (err) {
      setError(err.message);
      console.error('Error getting employee:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    createEmployee,
    modifyEmployee,
    removeEmployee,
    getEmployee,
    loadEmployees
  };
}; 