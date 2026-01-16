import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
        email,
        password_hash: hashedPassword,
        role: 'user',
        created_at: new Date(),
        last_login: null,
    });
    await newUser.save();
    return newUser;
};

export const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    return { token, user };
};

export const validateToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};