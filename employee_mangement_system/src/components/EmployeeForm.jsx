import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import './EmployeeForm.css';

const EmployeeForm = () => {
  const {
    employees,
    loading,
    error,
    createEmployee,
    removeEmployee,
    modifyEmployee
  } = useEmployees();

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    password: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmployeeId = (employeeId) => {
    if (!employeeId) {
      return 'Please provide a valid Employee ID';
    }
    if (!employeeId.startsWith('EMS')) {
      return 'Employee ID must start with "EMS"';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({}); // Clear previous errors

    // Validate employee ID format
    const employeeIdError = validateEmployeeId(formData.employeeId);
    if (employeeIdError) {
      setValidationErrors(prev => ({
        ...prev,
        employeeId: employeeIdError
      }));
      return;
    }

    try {
      if (editingId) {
        await modifyEmployee(editingId, formData);
      } else {
        await createEmployee(formData);
      }
      setFormData({
        name: '',
        employeeId: '',
        phone: '',
        email: '',
        password: ''
      });
      setEditingId(null);
    } catch (error) {
      // Handle specific validation errors
      if (error.message.includes('Employee ID already exists')) {
        setValidationErrors(prev => ({
          ...prev,
          employeeId: 'There are items that require your attention: This Employee ID is already in use'
        }));
      } else if (error.message.includes('Email ID already exists')) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'There are items that require your attention: This Email ID is already in use'
        }));
      } else if (error.message.includes('Employee not found')) {
        setValidationErrors(prev => ({
          ...prev,
          employeeId: 'There are items that require your attention: Employee ID not found'
        }));
      } else {
        console.error('Error saving employee:', error);
      }
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditingId(employee.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await removeEmployee(id);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="employee-container">
      <h2>Employee Management</h2>
      
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">Employee ID:</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            required
            className={validationErrors.employeeId ? 'error' : ''}
            placeholder="Enter ID starting with EMS"
          />
          {validationErrors.employeeId && (
            <div className="error-message">
              {validationErrors.employeeId}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={validationErrors.email ? 'error' : ''}
          />
          {validationErrors.email && (
            <div className="error-message">
              {validationErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingId ? 'Update Employee' : 'Add Employee'}
          </button>
          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: '',
                  employeeId: '',
                  phone: '',
                  email: '',
                  password: ''
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="employees-list">
        <h3>Employee List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.employeeId}</td>
                <td>{emp.phone}</td>
                <td>{emp.email}</td>
                <td>
                  <button 
                    onClick={() => handleEdit(emp)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeForm; 