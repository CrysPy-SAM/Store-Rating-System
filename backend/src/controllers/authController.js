const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ NORMALIZE ROLE TO LOWERCASE
    const normalizedRole = user.role.toLowerCase();

    console.log('🔐 Login successful for:', {
      id: user.id,
      email: user.email,
      role: normalizedRole,
      store_id: user.store_id
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        role: normalizedRole,  // ✅ Use lowercase role
        storeId: user.store_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,  // ✅ Return lowercase role
        storeId: user.store_id || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = await User.create({
      name,
      email,
      password: hashed,
      address,
      role: 'user',
    });

    // ✅ Create token and return user after signup
    const token = jwt.sign(
      { 
        id: userId, 
        role: 'user',
        storeId: null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,  // ✅ Return token
      user: { 
        id: userId, 
        email: email,
        name: name,
        role: 'user',
        storeId: null
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE PASSWORD ================= */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashed);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};