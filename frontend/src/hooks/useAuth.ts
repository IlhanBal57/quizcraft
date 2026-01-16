import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, register } from '../store/authSlice';
import { RootState } from '../store';

const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated on mount
        const checkAuth = async () => {
            // Logic to check authentication (e.g., token validation)
            setLoading(false);
        };
        checkAuth();
    }, []);

    const handleLogin = async (email: string, password: string) => {
        await dispatch(login({ email, password }));
    };

    const handleRegister = async (email: string, password: string) => {
        await dispatch(register({ email, password }));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return {
        user,
        isAuthenticated,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
    };
};

export default useAuth;