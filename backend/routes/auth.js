const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const emailjs = require('@emailjs/nodejs');
const router = express.Router();

// Check if all required env vars are present
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_PUBLIC_KEY',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
  }
}

console.log('✅ Environment variables check completed');

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Send verification email
const sendVerificationEmail = async (email, name, code) => {
  try {
    console.log('Attempting to send email via EmailJS REST API...');

    // Use REST API instead of the Node.js package
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // If you have one
        template_params: {
          to_email: email,
          to_name: name || 'Valued Customer',
          verification_code: code,
          from_name: 'Bowdeluxe',
          reply_to: 'noreply@bowdeluxe.com',
          subject: 'Verify Your Bowdeluxe Account'
        }
      })
    });

    const result = await response.text();
    console.log('EmailJS REST API response:', { status: response.status, result });

    if (response.ok) {
      return { success: true, message: 'Email sent' };
    } else {
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Error sending email via EmailJS REST API:', error);
    return { success: false, error: error.message };
  }
};

// Register - Step 1: Send verification code
router.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;

    console.log('Registration request for:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Check if user already exists and is verified
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email, is_verified')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(400).json({ 
          success: false, 
          error: 'User already exists' 
        });
      } else {
        console.log('User exists but not verified, resending code');
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old verification codes
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email);

    // Store new verification code
    const { error: dbError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        code: verificationCode,
        expires_at: expiresAt.toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Verification code stored in database for:', email);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, name, verificationCode);
    
    console.log('Email send result:', emailResult);

    if (!emailResult.success) {
      console.warn('Email sending failed, but code is stored. For development, code is:', verificationCode);
      
      // In development, still return success with the code for testing
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          success: true, 
          message: 'Verification code generated (email failed - check console)',
          devCode: verificationCode // Only in development!
        });
      }
      
      // In production, we need to try again or use fallback
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send verification email. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      // Only send code in development for testing
      ...(process.env.NODE_ENV === 'development' && { devCode: verificationCode })
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    });
  }
});

// Verify code and create user
router.post('/verify', async (req, res) => {
  try {
    const { email, code, password, name } = req.body;

    console.log('Verification request for:', email);

    if (!email || !code || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Get verification code
    const { data: verification } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!verification) {
      return res.status(400).json({ 
        success: false, 
        error: 'No verification code found. Please request a new code.' 
      });
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code expired. Please request a new code.' 
      });
    }

    // Check if code matches
    if (verification.code !== code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let userId;

    if (existingUser) {
      // Update existing unverified user
      userId = existingUser.id;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          password_hash: passwordHash,
          salt,
          full_name: name,
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email,
          password_hash: passwordHash,
          salt,
          full_name: name,
          role: 'user',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      userId = newUser.id;
    }

    // Mark code as verified
    await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User created/updated successfully:', email);

    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      token,
      userId
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name is required' 
      });
    }

    // Update user in database
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)
      .select()
      .single();

    if (error) throw error;

    // Remove sensitive data
    delete data.password_hash;
    delete data.salt;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: data 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update profile' 
    });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be at least 6 characters' 
      });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    // Update password in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        password_hash: passwordHash,
        salt,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId);

    if (updateError) throw updateError;

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to change password' 
    });
  }
});

// Login
// In your backend/routes/auth.js - Update the login endpoint

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(401).json({ 
        success: false, 
        error: 'Please verify your email first' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    const userResponse = { ...user };
    delete userResponse.password_hash;
    delete userResponse.salt;

    console.log('✅ Login successful for:', email, 'Role:', user.role);

    res.json({ 
      success: true, 
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Login failed' 
    });
  }
});

// Get current user from token
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Remove sensitive data
    delete user.password_hash;
    delete user.salt;

    res.json({ success: true, user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
});

// Logout (client-side only - JWT is stateless)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;