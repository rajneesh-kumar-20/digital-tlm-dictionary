// Backend/routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher");

const JWT_SECRET = process.env.JWT_SECRET || "tlm_super_secret_jwt_key_2026";

// 1. Teacher Register (Sign Up)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, schoolName } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, Email aur Password zaroori hain!",
        });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Teacher.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Yeh Email ID pehle se registered hai!",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = new Teacher({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      schoolName: schoolName ? schoolName.trim() : "Smart Classroom",
    });

    await newTeacher.save();

    const token = jwt.sign(
      { id: newTeacher._id, name: newTeacher.name, email: newTeacher.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "Teacher registration successful!",
      token,
      teacher: {
        id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        schoolName: newTeacher.schoolName,
      },
    });
  } catch (err) {
    console.error("Teacher Signup Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Registration failed on server" });
  }
});

// 2. Teacher Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email aur Password enter karein!" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const teacher = await Teacher.findOne({ email: cleanEmail });
    if (!teacher) {
      return res
        .status(401)
        .json({ success: false, message: "Galat Email ID ya Password!" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Galat Email ID ya Password!" });
    }

    const token = jwt.sign(
      { id: teacher._id, name: teacher.name, email: teacher.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: `Welcome back, ${teacher.name}!`,
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        schoolName: teacher.schoolName,
      },
    });
  } catch (err) {
    console.error("Teacher Login Error:", err);
    res.status(500).json({ success: false, message: "Login failed on server" });
  }
});

// 3. Get All Registered Teachers (Admin/Faculty List)
router.get("/all", async (req, res) => {
  try {
    // Password exclude karke baki details lana
    const teachers = await Teacher.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teachers,
    });
  } catch (err) {
    console.error("Fetch Teachers Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Teachers list load nahi ho saki" });
  }
});

module.exports = router;
