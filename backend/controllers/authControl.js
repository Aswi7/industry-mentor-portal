const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
require("dotenv").config();

const resolveUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(String(token), process.env.JWT_SECRET);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

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

const googleAuth = async (req, res) => {
  try {
    const requestedRole = String(req.query.role || "STUDENT").toUpperCase();
    const oauthRole = requestedRole === "MENTOR" ? "MENTOR" : "STUDENT";
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";

    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: "Google auth is not configured" });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const statePayload = {
      nonce: Math.random().toString(36).slice(2),
      role: oauthRole,
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "profile", "email"],
      state,
      prompt: "consent",
    });

    return res.redirect(authUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Google auth failed" });
  }
};

const googleCalendarAuth = async (req, res) => {
  try {
    const token =
      req.query.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);
    const userId = resolveUserFromToken(token);
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
      "http://localhost:5000/api/auth/google/calendar/callback";

    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: "Google auth is not configured" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const statePayload = {
      nonce: Math.random().toString(36).slice(2),
      userId,
    };
    if (req.query.sessionId) statePayload.sessionId = String(req.query.sessionId);
    if (req.query.startsAt) statePayload.startsAt = String(req.query.startsAt);
    if (req.query.endsAt) statePayload.endsAt = String(req.query.endsAt);
    if (req.query.next) statePayload.next = String(req.query.next);
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
      state,
      prompt: "consent",
      include_granted_scopes: true,
    });

    return res.redirect(url);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Google calendar auth failed" });
  }
};

const googleCalendarCallback = async (req, res) => {
  try {
    const { code, error, state } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
      "http://localhost:5000/api/auth/google/calendar/callback";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error || !code) {
      return res.redirect(`${frontendUrl}/auth/google/calendar/callback?error=Google calendar consent failed`);
    }

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth/google/calendar/callback?error=Google auth is not configured`);
    }

    let userId = null;
    let sessionId = null;
    let startsAt = null;
    let endsAt = null;
    let next = null;

    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(String(state), "base64url").toString("utf8"));
        userId = decoded?.userId || null;
        sessionId = decoded?.sessionId || null;
        startsAt = decoded?.startsAt || null;
        endsAt = decoded?.endsAt || null;
        next = decoded?.next || null;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      return res.redirect(`${frontendUrl}/auth/google/calendar/callback?error=Invalid calendar state`);
    }

    // STEP 8 + STEP 9: code extracted from callback query and exchanged for tokens.
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(String(code));
    oauth2Client.setCredentials(tokens);

    const existingUser = await User.findById(userId).select("googleRefreshToken");
    const refreshTokenToSave = tokens.refresh_token || existingUser?.googleRefreshToken || "";

    if (!refreshTokenToSave) {
      return res.redirect(`${frontendUrl}/auth/google/calendar/callback?error=No refresh token returned. Revoke app access in Google and reconnect.`);
    }

    await User.findByIdAndUpdate(userId, {
      googleRefreshToken: refreshTokenToSave,
      googleCalendarConnectedAt: new Date(),
    });

    const params = new URLSearchParams({ success: "1" });
    if (sessionId) params.set("sessionId", String(sessionId));
    if (startsAt) params.set("startsAt", String(startsAt));
    if (endsAt) params.set("endsAt", String(endsAt));
    if (next) params.set("next", String(next));

    return res.redirect(`${frontendUrl}/auth/google/calendar/callback?${params.toString()}`);
  } catch (err) {
    console.error(err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/auth/google/calendar/callback?error=Google calendar consent failed`);
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code, error, state } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error || !code) {
      return res.redirect(`${frontendUrl}/auth/google/callback?error=Google login failed`);
    }

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth/google/callback?error=Google auth is not configured`);
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

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(String(code));
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: profile } = await oauth2.userinfo.get();

    const googleId = profile.id;
    const email = profile.email ? profile.email.toLowerCase() : "";
    const name = profile.name || "Google User";

    if (!googleId || !email) {
      return res.redirect(`${frontendUrl}/auth/google/callback?error=Google profile is missing email`);
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: roleFromState,
        googleId,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
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
    return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${encodedUser}`);
  } catch (err) {
    console.error(err);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/auth/google/callback?error=Google login failed`);
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

    const admin = await User.findOne({ role: "ADMIN" })
      .select("email")
      .sort({ createdAt: 1 });

    res.status(200).json({ user, adminEmail: admin?.email || "" });
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
  googleAuth,
  googleCalendarAuth,
  googleCalendarCallback,
  googleCallback,
  getCurrentUser,
};
