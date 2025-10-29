import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loginMode, setLoginMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState([]);
  const [newExercise, setNewExercise] = useState({ exercise_name: '', sets: '', reps: '', weight: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchWorkouts();
    }
  }, [selectedDate, token]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/workouts/${selectedDate}`);
      setWorkouts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load workouts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = loginMode === 'login' ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API_URL}${endpoint}`, credentials);

      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      setCredentials({ username: '', password: '', email: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setWorkouts([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const addExercise = async (e) => {
    e.preventDefault();
    if (!newExercise.exercise_name) return;

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/workouts`, {
        ...newExercise,
        workout_date: selectedDate
      });

      setNewExercise({ exercise_name: '', sets: '', reps: '', weight: '' });
      fetchWorkouts();
    } catch (err) {
      setError('Failed to add exercise');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (workoutId) => {
    if (!window.confirm('Delete this exercise?')) return;

    try {
      await axios.delete(`${API_URL}/workouts/${workoutId}`);
      fetchWorkouts();
    } catch (err) {
      setError('Failed to delete exercise');
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #7c3aed, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '2rem', width: '100%', maxWidth: '28rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>💪 Fitness Tracker</h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Track your workouts and progress</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setLoginMode('login')}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', background: loginMode === 'login' ? '#7c3aed' : '#e5e7eb', color: loginMode === 'login' ? 'white' : '#374151' }}
            >
              Login
            </button>
            <button
              onClick={() => setLoginMode('signup')}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', background: loginMode === 'signup' ? '#7c3aed' : '#e5e7eb', color: loginMode === 'signup' ? 'white' : '#374151' }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }}
                required
              />
            </div>

            {loginMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Email (Optional)</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: '#7c3aed', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Please wait...' : loginMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #7c3aed, #4338ca)', padding: '1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>💪 Fitness Tracker</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#374151' }}>👤 {user?.username}</span>
              <button
                onClick={handleLogout}
                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>📅 Select Workout Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1.125rem' }}
          />
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>➕ Add Exercise</h2>
          <form onSubmit={addExercise} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Exercise name"
              value={newExercise.exercise_name}
              onChange={(e) => setNewExercise({ ...newExercise, exercise_name: e.target.value })}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              required
            />
            <input
              type="number"
              placeholder="Sets"
              value={newExercise.sets}
              onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <input
              type="number"
              placeholder="Reps"
              value={newExercise.reps}
              onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Weight (lbs)"
              value={newExercise.weight}
              onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ gridColumn: '1 / -1', background: '#7c3aed', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Adding...' : '➕ Add Exercise'}
            </button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            📋 Workout Log - {new Date(selectedDate).toLocaleDateString()}
          </h2>

          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>
          ) : workouts.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No exercises logged for this date</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#faf5ff', borderRadius: '0.5rem', border: '1px solid #e9d5ff' }}
                >
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.125rem' }}>{workout.exercise_name}</h3>
                    <p style={{ color: '#6b7280' }}>
                      {workout.sets && `${workout.sets} sets`}
                      {workout.sets && workout.reps && ' × '}
                      {workout.reps && `${workout.reps} reps`}
                      {workout.weight && ` @ ${workout.weight} lbs`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExercise(workout.id)}
                    style={{ padding: '0.5rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.5rem' }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;