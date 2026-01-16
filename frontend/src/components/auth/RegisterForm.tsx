import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/authSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        try {
            await dispatch(registerUser({ email, password })).unwrap();
            // Handle successful registration (e.g., redirect or show a success message)
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <Button type="submit">Register</Button>
        </form>
    );
};

export default RegisterForm;