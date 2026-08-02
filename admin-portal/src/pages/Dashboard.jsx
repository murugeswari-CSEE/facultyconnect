import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [professors, setProfessors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');

  const fetchProfessors = () => {
    axios.get('https://facultyconnect-241s.onrender.com/api/professors')
      .then((res) => setProfessors(res.data))
      .catch((err) => console.error('Error fetching professors:', err));
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleAddProfessor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://facultyconnect-241s.onrender.com/api/professors', {
        name, email, password, department,
      });
      setName(''); setEmail(''); setPassword(''); setDepartment('');
      fetchProfessors();
    } catch (err) {
      console.error('Error adding professor:', err);
      alert('Failed to add professor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this professor?')) return;
    try {
      await axios.delete(`https://facultyconnect-241s.onrender.com/api/professors/${id}`);
      fetchProfessors();
    } catch (err) {
      console.error('Error deleting professor:', err);
    }
  };

  const startEdit = (prof) => {
    setEditingId(prof._id);
    setEditName(prof.name);
    setEditDept(prof.department);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`https://facultyconnect-241s.onrender.com/api/professors/${id}`, {
        name: editName,
        department: editDept,
      });
      setEditingId(null);
      fetchProfessors();
    } catch (err) {
      console.error('Error updating professor:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Admin Dashboard</h2>

      <h3>Add Professor</h3>
      <form onSubmit={handleAddProfessor} style={{ marginBottom: '30px' }}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Professor</button>
      </form>

      <h3>All Professors</h3>
      <ul style={{ padding: 0 }}>
        {professors.map((prof) => (
          <li key={prof._id} style={{ listStyle: 'none', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            {editingId === prof._id ? (
              <div>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  style={{ display: 'block', marginBottom: '5px', padding: '6px' }} />
                <input value={editDept} onChange={(e) => setEditDept(e.target.value)}
                  style={{ display: 'block', marginBottom: '5px', padding: '6px' }} />
                <button onClick={() => saveEdit(prof._id)} style={{ marginRight: '8px' }}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>{prof.name}</strong> - {prof.department} - {prof.email}
                <div style={{ marginTop: '6px' }}>
                  <button onClick={() => startEdit(prof)} style={{ marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(prof._id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;