import React, { useState, useEffect } from 'react';

export default function FitnessTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [loginMode, setLoginMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState({});
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', weight: '' });

  useEffect(() => {
    const savedUsers = JSON.parse(sessionStorage.getItem('fitnessUsers') || '{}');
    const savedCurrentUser = sessionStorage.getItem('currentUser');
    setUsers(savedUsers);
    if (savedCurrentUser && savedUsers[savedCurrentUser]) {
      setCurrentUser(savedCurrentUser);
      setWorkouts(savedUsers[savedCurrentUser].workouts || {});
    }
  }, []);

  const saveToStorage = (updatedUsers, username) => {
    sessionStorage.setItem('fitnessUsers', JSON.stringify(updatedUsers));
    sessionStorage.setItem('currentUser', username);
  };

  const handleAuth = () => {
    const { username, password } = credentials;

    if (loginMode === 'signup') {
      if (users[username]) {
        alert('Username already exists!');
        return;
      }
      const newUsers = { ...users, [username]: { password, workouts: {} } };
      setUsers(newUsers);
      setCurrentUser(username);
      setWorkouts({});
      saveToStorage(newUsers, username);
      setCredentials({ username: '', password: '' });
    } else {
      if (users[username] && users[username].password === password) {
        setCurrentUser(username);
        setWorkouts(users[username].workouts || {});
        sessionStorage.setItem('currentUser', username);
        setCredentials({ username: '', password: '' });
      } else {
        alert('Invalid credentials!');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWorkouts({});
    sessionStorage.removeItem('currentUser');
    setCredentials({ username: '', password: '' });
  };

  const addExercise = () => {
    if (!newExercise.name) return;

    const updatedWorkouts = {
      ...workouts,
      [selectedDate]: [
        ...(workouts[selectedDate] || []),
        { ...newExercise, id: Date.now() }
      ]
    };

    setWorkouts(updatedWorkouts);
    const updatedUsers = {
      ...users,
      [currentUser]: { ...users[currentUser], workouts: updatedWorkouts }
    };
    setUsers(updatedUsers);
    sessionStorage.setItem('fitnessUsers', JSON.stringify(updatedUsers));
    setNewExercise({ name: '', sets: '', reps: '', weight: '' });
  };

  const deleteExercise = (exerciseId) => {
    const updatedWorkouts = {
      ...workouts,
      [selectedDate]: workouts[selectedDate].filter(ex => ex.id !== exerciseId)
    };

    setWorkouts(updatedWorkouts);
    const updatedUsers = {
      ...users,
      [currentUser]: { ...users[currentUser], workouts: updatedWorkouts }
    };
    setUsers(updatedUsers);
    sessionStorage.setItem('fitnessUsers', JSON.stringify(updatedUsers));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <span className="text-6xl">💪</span>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-white">Fitness Tracker</h1>
          <p className="text-center text-gray-400 mb-6">Track your workouts and progress</p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMode('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${loginMode === 'login'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setLoginMode('signup')}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${loginMode === 'signup'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300'
                }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <button
              onClick={handleAuth}
              className="w-full bg-cyan-500 text-white py-2 rounded-lg font-semibold hover:bg-cyan-600 transition"
            >
              {loginMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todaysWorkouts = workouts[selectedDate] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💪</span>
              <h1 className="text-2xl font-bold text-white">Fitness Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-xl">👤</span>
                <span className="font-medium">{currentUser}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-bold text-white">Select Workout Date</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg outline-none"
          />
        </div>

        {/* Add Exercise Form */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">➕</span>
            <h2 className="text-xl font-bold text-white">Add Exercise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Exercise name"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              placeholder="Sets"
              value={newExercise.sets}
              onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              placeholder="Reps"
              value={newExercise.reps}
              onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Weight (lbs)"
              value={newExercise.weight}
              onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            <button
              onClick={addExercise}
              className="md:col-span-2 bg-cyan-500 text-white py-2 rounded-lg font-semibold hover:bg-cyan-600 transition flex items-center justify-center gap-2"
            >
              <span>➕</span>
              Add Exercise
            </button>
          </div>
        </div>

        {/* Workout Log */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            📋 Workout Log - {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          {todaysWorkouts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No exercises logged for this date</p>
          ) : (
            <div className="space-y-3">
              {todaysWorkouts.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div>
                    <h3 className="font-bold text-white text-lg">{exercise.name}</h3>
                    <p className="text-gray-300">
                      {exercise.sets && `${exercise.sets} sets`}
                      {exercise.sets && exercise.reps && ' × '}
                      {exercise.reps && `${exercise.reps} reps`}
                      {exercise.weight && ` @ ${exercise.weight} lbs`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExercise(exercise.id)}
                    className="p-2 text-red-400 hover:bg-gray-600 rounded-lg transition text-xl"
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