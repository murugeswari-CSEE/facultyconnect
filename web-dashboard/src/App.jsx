import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const statusColors = {
  'In Cabin': '#2ecc71',
  'In Class': '#f1c40f',
  'In Meeting': '#3498db',
  'Out of Office': '#e74c3c',
};

const socket = io('https://facultyconnect-241s.onrender.com');

function App() {
  const [professors, setProfessors] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    axios.get('https://facultyconnect-241s.onrender.com/api/professors')
      .then((res) => setProfessors(res.data))
      .catch((err) => console.error('Error fetching professors:', err));
  }, []);

  useEffect(() => {
    professors.forEach((prof) => {
      axios.get(`https://facultyconnect-241s.onrender.com/api/status/${prof._id}`)
        .then((res) => {
          setStatuses((prev) => ({ ...prev, [prof._id]: res.data }));
        })
        .catch((err) => console.error('Error fetching status:', err));
    });
  }, [professors]);

  useEffect(() => {
    socket.on('statusUpdate', (data) => {
      axios.get(`https://facultyconnect-241s.onrender.com/api/status/${data.professorId}`)
        .then((res) => {
          setStatuses((prev) => ({ ...prev, [data.professorId]: res.data }));
        })
        .catch((err) => console.error('Error re-fetching status:', err));
    });

    return () => {
      socket.off('statusUpdate');
    };
  }, []);

  const departments = ['All', ...new Set(professors.map((p) => p.department))];

  const filteredProfessors = professors.filter((prof) => {
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || prof.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <h1>FacultyConnect - Student Dashboard</h1>

      <input
        type="text"
        placeholder="Search professor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', marginRight: '10px' }}
      />

      <select
        value={departmentFilter}
        onChange={(e) => setDepartmentFilter(e.target.value)}
        style={{ padding: '8px' }}
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>

      <ul style={{ padding: 0, marginTop: '20px' }}>
        {filteredProfessors.map((prof) => {
          const status = statuses[prof._id];
          return (
            <li key={prof._id} style={{ marginBottom: '10px', listStyle: 'none' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: statusColors[status?.status] || '#ccc',
                  marginRight: '8px',
                }}
              ></span>
              <strong>{prof.name}</strong> - {prof.department} —{' '}
              {status ? status.status : 'Loading...'}
              {status?.subject && ` (${status.subject}, Room ${status.classroom}, Free at ${status.freeAt})`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;