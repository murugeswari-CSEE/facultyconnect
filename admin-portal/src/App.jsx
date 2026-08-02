import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetables from './pages/Timetables';
import Departments from './pages/Departments';
import Logs from './pages/Logs';

function App() {
  return (
    <div>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/dashboard" style={{ marginRight: '15px' }}>
          Professors
        </Link>
        <Link to="/timetables">
          Timetables
        </Link>
        <Link to="/departments" style={{ marginRight: '15px' }}>
          Departments
        </Link>
        <Link to="/logs">Logs</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetables" element={<Timetables />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </div>
  );
}

export default App;