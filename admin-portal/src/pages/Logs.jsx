import { useState, useEffect } from 'react';
import axios from 'axios';

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/logs').then((res) => setLogs(res.data));
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Activity Logs</h2>
      <ul style={{ padding: 0 }}>
        {logs.map((log) => (
          <li key={log._id} style={{ listStyle: 'none', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
            <strong>{log.professor?.name}</strong> — {log.action}: {log.details}
            <div style={{ fontSize: '12px', color: '#888' }}>{new Date(log.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Logs;