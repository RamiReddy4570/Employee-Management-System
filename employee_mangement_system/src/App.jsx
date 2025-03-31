import { useState } from 'react'
import './App.css'
import TodoList from './components/TodoList'
import EmployeeForm from './components/EmployeeForm'

function App() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Employee Management System</h1>
      </header>
      
      <nav className="app-nav">
        <button 
          className={`nav-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Details
        </button>
        <button 
          className={`nav-button ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todo List
        </button>
      </nav>

      <main>
        {activeTab === 'employees' ? <EmployeeForm /> : <TodoList />}
      </main>
    </div>
  )
}

export default App
