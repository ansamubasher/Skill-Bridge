const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const Projects = require("../models/Project.js");

const users = [
  {
    name: "Ali Khan",
    email: "ali@gmail.com",
    password: "123456",
    role: ["freelancer"],
    department: "Computer Science",
    academicYear: "3rd Year",
    skills: ["React", "Node.js", "MongoDB"],
    bio: "Full-stack developer specializing in MERN stack.",
  },
  {
    name: "Sara Ahmed",
    email: "sara@gmail.com",
    password: "123456",
    role: ["client"],
    department: "Business",
    academicYear: "Final Year",
    skills: [],
    bio: "Looking for freelance developers for startup projects.",
  },
  {
    name: "Hassan Raza",
    email: "hassan@gmail.com",
    password: "123456",
    role: ["freelancer"],
    department: "Software Engineering",
    academicYear: "2nd Year",
    skills: ["UI/UX", "Figma", "React"],
    bio: "Frontend developer and designer.",
  },
  {
    name: "Ayesha Malik",
    email: "ayesha@gmail.com",
    password: "123456",
    role: ["client"],
    department: "IT",
    academicYear: "Graduate",
    skills: [],
    bio: "Hiring freelancers for web and mobile apps.",
  },
  {
    name: "Usman Tariq",
    email: "usman@gmail.com",
    password: "123456",
    role: ["freelancer"],
    department: "Computer Science",
    academicYear: "4th Year",
    skills: ["Express", "Node.js", "APIs"],
    bio: "Backend developer focused on scalable APIs.",
  },
];

const projects = [
  {
    title: "MERN Stack Freelancing Platform",
    description:
      "Build a full-stack freelancing platform with bidding system, authentication, and messaging.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Express"],
    budget: { min: 200, max: 500 },
    status: "open",
    deadline: new Date("2026-06-01"),
  },
  {
    title: "E-commerce Website",
    description:
      "Create a modern e-commerce platform with cart, checkout, and admin panel.",
    requiredSkills: ["React", "Node.js", "MongoDB"],
    budget: { min: 150, max: 400 },
    status: "open",
    deadline: new Date("2026-05-20"),
  },
  {
    title: "Portfolio Website for Designer",
    description:
      "Design and develop a responsive portfolio website for a UI/UX designer.",
    requiredSkills: ["HTML", "CSS", "React"],
    budget: { min: 50, max: 150 },
    status: "open",
    deadline: new Date("2026-05-10"),
  },
];

const seedDB = async () => {
  try {
    console.log("Seeding database...");

    // hash passwords BEFORE inserting
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );

    await User.deleteMany();
    await User.insertMany(hashedUsers);

    console.log("Dummy users inserted ✅");

    const clientUser = await User.findOne({ role: "client" });

    if (!clientUser) {
      console.log("No client found. Seed aborted.");
      return;
    }

    const projectsWithClient = projects.map((p) => ({
      ...p,
      client: clientUser._id,
    }));

    await Projects.deleteMany();
    await Projects.insertMany(projectsWithClient);

    console.log("Dummy projects inserted ✅");
  } catch (err) {
    console.error("Seed error:", err);
  }
};

module.exports = seedDB;