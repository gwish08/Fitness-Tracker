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