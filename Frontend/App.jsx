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
            fetchUserData();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchWorkouts();
        }
    }, [selectedDate, token]);

    const fetchUserData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    };

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
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Fitness Tracker</h1>
                        <p className="text-gray-600 mt-2">Track your workouts and progress</p>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setLoginMode('login')}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${loginMode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setLoginMode('signup')}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${loginMode === 'signup' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        {loginMode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Please wait...' : loginMode === 'login' ? 'Login' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Fitness Tracker</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">👤 {user?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Date Selector */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Select Workout Date</h2>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg"
                    />
                </div>

                {/* Add Exercise Form */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Add Exercise</h2>
                    <form onSubmit={addExercise} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Exercise name"
                            value={newExercise.exercise_name}
                            onChange={(e) => setNewExercise({ ...newExercise, exercise_name: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Sets"
                            value={newExercise.sets}
                            onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Reps"
                            value={newExercise.reps}
                            onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Weight (lbs)"
                            value={newExercise.weight}
                            onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="md:col-span-2 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Exercise'}
                        </button>
                    </form>
                </div>

                {/* Workout Log */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📋 Workout Log - {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Loading...</p>
                    ) : workouts.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No exercises logged for this date</p>
                    ) : (
                        <div className="space-y-3">
                            {workouts.map((workout) => (
                                <div
                                    key={workout.id}
                                    className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{workout.exercise_name}</h3>
                                        <p className="text-gray-600">
                                            {workout.sets && `${workout.sets} sets`}
                                            {workout.sets && workout.reps && ' × '}
                                            {workout.reps && `${workout.reps} reps`}
                                            {workout.weight && ` @ ${workout.weight} lbs`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteExercise(workout.id)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
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
