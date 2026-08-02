import { useState, useEffect } from 'react';
import axios from 'axios';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');

  const fetchDepts = () => {
    axios.get('http://localhost:5000/api/departments').then((res) => setDepartments(res.data));
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/departments', { name });
      setName('');
      fetchDepts();
    } catch (err) {
      alert('Failed to add department.');
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/departments/${id}`);
    fetchDepts();
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Manage Departments</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: '20px' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name"
          style={{ padding: '8px', marginRight: '10px' }} required />
        <button type="submit" style={{ padding: '8px 16px' }}>Add</button>
      </form>
      <ul style={{ padding: 0 }}>
        {departments.map((d) => (
          <li key={d._id} style={{ listStyle: 'none', marginBottom: '8px' }}>
            {d.name} <button onClick={() => handleDelete(d._id)} style={{ marginLeft: '10px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Departments;