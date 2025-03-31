const GITHUB_API_URL = 'https://api.github.com/repos/RamiReddy4570/Employee-Management-System/contents/EmployeeManagementSystemDB/Employee.json';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Validate GitHub token
if (!GITHUB_TOKEN || GITHUB_TOKEN === 'your_github_token_here') {
  throw new Error(
    'GitHub token is not properly configured. Please follow these steps:\n' +
    '1. Go to GitHub Settings > Developer Settings > Personal Access Tokens\n' +
    '2. Generate a new token with "repo" scope\n' +
    '3. Copy the token and update your .env file with:\n' +
    '   VITE_GITHUB_TOKEN=your_actual_token_here\n' +
    '4. Restart your development server'
  );
}

// Helper function to encode content for GitHub API
const encodeContent = (content) => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
};

// Helper function to decode content from GitHub API
const decodeContent = (content) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(content))));
  } catch (error) {
    console.error('Error decoding content:', error);
    return [];
  }
};

// Helper function to handle GitHub API errors
const handleGitHubError = async (response, operation) => {
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = `Failed to ${operation}: ${errorData.message}`;
    
    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please check your GitHub token.';
    } else if (response.status === 403) {
      errorMessage = 'Access denied. Please check your repository permissions.';
    } else if (response.status === 404) {
      errorMessage = 'Repository or file not found. Please check the repository URL.';
    }
    
    throw new Error(errorMessage);
  }
  return response;
};

// Helper function to validate unique fields
const validateUniqueFields = (employees, employeeData, excludeId = null) => {
  const existingEmployee = employees.find(emp => 
    (emp.employeeId === employeeData.employeeId || emp.emailId === employeeData.emailId) &&
    (!excludeId || emp.id !== excludeId)
  );

  if (existingEmployee) {
    if (existingEmployee.employeeId === employeeData.employeeId) {
      throw new Error('Employee ID already exists');
    }
    if (existingEmployee.emailId === employeeData.emailId) {
      throw new Error('Email ID already exists');
    }
  }
};

// Initialize empty JSON file if it doesn't exist
const initializeJsonFile = async () => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.status === 404) {
      // File doesn't exist, create it
      const createResponse = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Initialize Employee.json',
          content: encodeContent([]),
        })
      });

      await handleGitHubError(createResponse, 'create Employee.json');
      return [];
    }
    return null;
  } catch (error) {
    console.error('Error initializing JSON file:', error);
    throw error;
  }
};

// Fetch all employees from GitHub
export const fetchEmployees = async () => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // File doesn't exist, initialize it
        return await initializeJsonFile();
      }
      await handleGitHubError(response, 'fetch employees');
    }

    const data = await response.json();
    return decodeContent(data.content);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

// Add new employee to GitHub
export const addEmployee = async (employeeData) => {
  try {
    // First, get current content
    const currentData = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let currentContent;
    let currentEmployees = [];

    if (currentData.ok) {
      currentContent = await currentData.json();
      currentEmployees = decodeContent(currentContent.content);
    }

    // Validate unique fields
    validateUniqueFields(currentEmployees, employeeData);

    // Add new employee
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      createdAt: new Date().toISOString()
    };
    currentEmployees.push(newEmployee);

    // Update GitHub file
    const response = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Add new employee',
        content: encodeContent(currentEmployees),
        sha: currentContent?.sha
      })
    });

    await handleGitHubError(response, 'add employee');
    return newEmployee;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// Update employee in GitHub
export const updateEmployee = async (id, updatedData) => {
  try {
    // First, get current content
    const currentData = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    await handleGitHubError(currentData, 'fetch current data');

    const currentContent = await currentData.json();
    const currentEmployees = decodeContent(currentContent.content);

    // Find and update employee
    const index = currentEmployees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }

    // Validate unique fields
    validateUniqueFields(currentEmployees, updatedData, id);

    currentEmployees[index] = {
      ...currentEmployees[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    // Update GitHub file
    const response = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update employee',
        content: encodeContent(currentEmployees),
        sha: currentContent.sha
      })
    });

    await handleGitHubError(response, 'update employee');
    return currentEmployees[index];
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete employee from GitHub
export const deleteEmployee = async (id) => {
  try {
    // First, get current content
    const currentData = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    await handleGitHubError(currentData, 'fetch current data');

    const currentContent = await currentData.json();
    const currentEmployees = decodeContent(currentContent.content);

    // Filter out the employee to delete
    const updatedEmployees = currentEmployees.filter(emp => emp.id !== id);
    if (updatedEmployees.length === currentEmployees.length) {
      throw new Error('Employee not found');
    }

    // Update GitHub file
    const response = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Delete employee',
        content: encodeContent(updatedEmployees),
        sha: currentContent.sha
      })
    });

    await handleGitHubError(response, 'delete employee');
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

// Get single employee by ID from GitHub
export const getEmployeeById = async (id) => {
  try {
    const employees = await fetchEmployees();
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
}; 