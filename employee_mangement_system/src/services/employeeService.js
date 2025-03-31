// Employee Service for handling CRUD operations

// In-memory storage (replace with actual API calls in production)
let employees = [];

// Fetch all employees
export const fetchEmployees = () => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve([...employees]);
    }, 500);
  });
};

// Add new employee
export const addEmployee = (employeeData) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const newEmployee = {
        id: Date.now(),
        ...employeeData,
        createdAt: new Date().toISOString()
      };
      employees.push(newEmployee);
      resolve(newEmployee);
    }, 500);
  });
};

// Update employee
export const updateEmployee = (id, updatedData) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) {
        reject(new Error('Employee not found'));
        return;
      }
      employees[index] = {
        ...employees[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      resolve(employees[index]);
    }, 500);
  });
};

// Delete employee
export const deleteEmployee = (id) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) {
        reject(new Error('Employee not found'));
        return;
      }
      employees = employees.filter(emp => emp.id !== id);
      resolve(true);
    }, 500);
  });
};

// Get single employee by ID
export const getEmployeeById = (id) => {
  return new Promise((resolve, reject) => {
    // Simulate API delay
    setTimeout(() => {
      const employee = employees.find(emp => emp.id === id);
      if (!employee) {
        reject(new Error('Employee not found'));
        return;
      }
      resolve(employee);
    }, 500);
  });
}; 