const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, domain, studentSkills, studentDomain, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "STUDENT",
      skills,
      domain,
      studentSkills,
      studentDomain,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const linkedinAuth = async (req, res) => {
  try {
    const requestedRole = String(req.query.role || "STUDENT").toUpperCase();
    const oauthRole = requestedRole === "MENTOR" ? "MENTOR" : "STUDENT";
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:5000/api/auth/linkedin/callback";

    if (!clientId) {
      return res.status(500).json({ message: "LinkedIn auth is not configured" });
    }

    const statePayload = {
      nonce: Math.random().toString(36).slice(2),
      role: oauthRole,
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");
    const scope = encodeURIComponent("openid profile email");
    const authUrl =
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

    return res.redirect(authUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "LinkedIn auth failed" });
  }
};

const linkedinCallback = async (req, res) => {
  try {
    const { code, error, state } = req.query;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:5000/api/auth/linkedin/callback";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error || !code) {
      return res.redirect(`${frontendUrl}/auth/linkedin/callback?error=LinkedIn login failed`);
    }

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth/linkedin/callback?error=LinkedIn auth is not configured`);
    }

    let roleFromState = "STUDENT";
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(String(state), "base64url").toString("utf8"));
        if (decoded?.role === "MENTOR") roleFromState = "MENTOR";
      } catch {
        roleFromState = "STUDENT";
      }
    }

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect(`${frontendUrl}/auth/linkedin/callback?error=Could not verify LinkedIn account`);
    }

    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profileResponse.json();
    const linkedinId = profile.sub;
    const email = profile.email;
    const name = profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(" ") || "LinkedIn User";

    if (!linkedinId || !email) {
      return res.redirect(`${frontendUrl}/auth/linkedin/callback?error=LinkedIn profile is missing email`);
    }

    let user = await User.findOne({
      $or: [{ linkedinId }, { email: email.toLowerCase() }],
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: roleFromState,
        linkedinId,
      });
    } else if (!user.linkedinId) {
      user.linkedinId = linkedinId;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    const encodedUser = encodeURIComponent(JSON.stringify(userResponse));
    return res.redirect(`${frontendUrl}/auth/linkedin/callback?token=${token}&user=${encodedUser}`);
  } catch (err) {
    console.error(err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/auth/linkedin/callback?error=LinkedIn login failed`);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ message: `You are not registered as ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      token,
      user: userResponse
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  linkedinAuth,
  linkedinCallback,
  getCurrentUser,
};
