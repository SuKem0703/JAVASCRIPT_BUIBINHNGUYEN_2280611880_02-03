require('dotenv').config();
console.log("Kiem tra URI:", process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const roleSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, default: "" },
    avatarUrl: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    status: { type: Boolean, default: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    loginCount: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

app.post('/roles', async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json(role);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json({ message: 'Role soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).populate('role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User soft deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/enable', async (req, res) => {
    const { email, username } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Invalid credentials or user not found' });
        res.status(200).json({ message: 'User enabled successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/disable', async (req, res) => {
    const { email, username } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: false },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Invalid credentials or user not found' });
        res.status(200).json({ message: 'User disabled successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017/AssignmentDB";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => console.error('MongoDB connection error:', error));