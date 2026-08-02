import { useState, useEffect } from 'react';
import axios from 'axios';

function Timetables() {
  const [professors, setProfessors] = useState([]);
  const [professorId, setProfessorId] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [classroom, setClassroom] = useState('');
  const [batch, setBatch] = useState('');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axios.get('https://facultyconnect-241s.onrender.com/api/professors')
      .then((res) => setProfessors(res.data));
  }, []);

  const fetchSlots = (id) => {
    if (!id) return;
    axios.get(`https://facultyconnect-241s.onrender.com/api/timetables/${id}`)
      .then((res) => setSlots(res.data));
  };

  useEffect(() => {
    fetchSlots(professorId);
  }, [professorId]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://facultyconnect-241s.onrender.com/api/timetables', {
        professor: professorId, day, startTime, endTime, subject, classroom, batch,
      });
      setSubject(''); setClassroom(''); setBatch(''); setStartTime(''); setEndTime('');
      fetchSlots(professorId);
    } catch (err) {
      console.error(err);
      alert('Failed to add timetable slot.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Manage Timetables</h2>

      <select value={professorId} onChange={(e) => setProfessorId(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '20px' }}>
        <option value="">Select a professor</option>
        {professors.map((p) => (
          <option key={p._id} value={p._id}>{p.name} - {p.department}</option>
        ))}
      </select>

      {professorId && (
        <>
          <form onSubmit={handleAddSlot} style={{ marginBottom: '30px' }}>
            <select value={day} onChange={(e) => setDay(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
            <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
            <input type="text" placeholder="Classroom" value={classroom} onChange={(e) => setClassroom(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
            <input type="text" placeholder="Batch" value={batch} onChange={(e) => setBatch(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} required />
            <button type="submit" style={{ padding: '8px 16px' }}>Add Slot</button>
          </form>

          <h3>Existing Slots</h3>
          <ul style={{ padding: 0 }}>
            {slots.map((s) => (
              <li key={s._id} style={{ listStyle: 'none', marginBottom: '8px' }}>
                {s.day} {s.startTime}–{s.endTime}: {s.subject} (Room {s.classroom}, {s.batch})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Timetables;