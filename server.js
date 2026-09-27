const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "student-profiling-session-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/* =========================================================
   MONGOOSE SCHEMAS
========================================================= */

const semesterSchema = new mongoose.Schema(
  {
    semesterNumber: Number,

    sgpa: Number,

    cgpa: Number,

    attendance: Number,

    arrearStatus: {
      type: String,

      enum: ["Yes", "No"],

      default: "No"
    },

    numberOfArrears: {
      type: Number,

      default: 0
    },

    academicAchievements: String,

    goodSubjects: String
  },
  {
    _id: true
  }
);

const arrearSchema = new mongoose.Schema(
  {
    semester: Number,

    subjectCode: String,

    subjectName: String,

    attempts: Number,

    status: {
      type: String,

      enum: ["Pending", "Cleared"],

      default: "Pending"
    },

    clearedSemester: Number,

    gradeAfterClearing: String,

    reason: String,

    remedialSupport: {
      type: String,

      enum: ["Yes", "No"],

      default: "No"
    }
  },
  {
    _id: true
  }
);

const studentSchema = new mongoose.Schema(
  {
    passwordHash: {
      type: String,

      default: ""
    },

    personal: {
      registerNumber: {
        type: String,

        required: true,

        unique: true,

        trim: true
      },

      name: {
        type: String,

        required: true,

        trim: true
      },

      dob: String,

      gender: String,

      department: String,

      section: String,

      institutionalEmail: String,

      personalEmail: String,

      mobile: String,

      address: String,

      category: String,

      hostelName: String,

      distance: Number
    },

    family: {
      fatherName: String,

      fatherOccupation: String,

      fatherIncome: String,

      fatherMobile: String,

      motherName: String,

      motherOccupation: String,

      motherIncome: String,

      motherMobile: String,

      guardianName: String,

      emergencyContact: String,

      firstGeneration: String,

      scholarship: String,

      financialGuidance: String
    },

    semesters: [
      semesterSchema
    ],

    arrears: [
      arrearSchema
    ],

    technical: {
      programmingLanguages: String,

      skills: String,

      areaOfInterest: String,

      preferredDomain: String,

      certifications: String,

      projects: String,

      projectGithub: String,

      hackathons: String,

      internship: String,

      github: String,

      linkedin: String,

      hackerRank: String,

      hackerEarth: String,

      communicationLevel: String,

      aptitudeLevel: String
    },

    evaluation: {
      academicStrengths: String,

      technicalStrengths: String,

      communicationStrengths: String,

      leadershipTeamwork: String,

      improvementAreas: String,

      supportSubjects: String,

      skillsToDevelop: String,

      communicationAptitudeImprove:
        String,

      mentorSupport: String,

      shortTermGoal: String,

      longTermGoal: String
    },

    careerGoal: {
      goal: {
        type: String,

        enum: [
          "Placement",
          "Higher Studies",
          "Entrepreneurship",
          ""
        ]
      },

      placement:
        mongoose.Schema.Types.Mixed,

      higherStudies:
        mongoose.Schema.Types.Mixed,

      entrepreneurship:
        mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

const Student =
  mongoose.model(
    "Student",
    studentSchema
  );

/* =========================================================
   AUTHORIZATION MIDDLEWARE
========================================================= */

function requireAuth(
  req,
  res,
  next
) {
  if (req.session.user) {
    return next();
  }

  return res.status(401).json({
    message:
      "Please login first."
  });
}

function requireAdmin(
  req,
  res,
  next
) {
  if (
    req.session.user?.role ===
    "admin"
  ) {
    return next();
  }

  return res.status(403).json({
    message:
      "Admin access required."
  });
}

function requireStudent(
  req,
  res,
  next
) {
  if (
    req.session.user?.role ===
    "student"
  ) {
    return next();
  }

  return res.status(403).json({
    message:
      "Student access required."
  });
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
  "/api/admin/login",
  (req, res) => {
    const {
      email,
      password
    } = req.body;

    /*
      ADMIN CREDENTIALS ARE NEVER
      STORED IN THE FRONTEND.

      They must be configured in
      ByteXL Nimbus Environment Variables.
    */

    const adminEmail =
      process.env.ADMIN_EMAIL;

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(500).json({
        message:
          "Admin credentials are not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD in Nimbus environment variables."
      });
    }

    if (
      email !== adminEmail ||
      password !== adminPassword
    ) {
      return res.status(401).json({
        message:
          "Invalid admin credentials."
      });
    }

    req.session.user = {
      role: "admin",

      email: adminEmail
    };

    return res.json({
      message:
        "Admin login successful",

      role: "admin"
    });
  }
);

/* =========================================================
   STUDENT REGISTRATION
========================================================= */

app.post(
  "/api/student/register",
  async (req, res) => {
    try {
      const {
        registerNumber,
        name,
        password
      } = req.body;

      if (
        !registerNumber ||
        !name ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Register number, name and password are required."
        });
      }

      if (
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters."
        });
      }

      const cleanRegisterNumber =
        registerNumber.trim();

      const existingStudent =
        await Student.findOne({
          "personal.registerNumber":
            cleanRegisterNumber
        });

      if (existingStudent) {
        return res.status(409).json({
          message:
            "Register number already exists."
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const student =
        await Student.create({
          passwordHash,

          personal: {
            registerNumber:
              cleanRegisterNumber,

            name: name.trim()
          }
        });

      req.session.user = {
        role: "student",

        studentId:
          String(student._id),

        registerNumber:
          student.personal
            .registerNumber
      };

      return res.status(201).json({
        message:
          "Student account created successfully.",

        role: "student"
      });
    } catch (error) {
      console.error(
        "Student registration error:",
        error
      );

      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   STUDENT LOGIN
========================================================= */

app.post(
  "/api/student/login",
  async (req, res) => {
    try {
      const {
        registerNumber,
        password
      } = req.body;

      const student =
        await Student.findOne({
          "personal.registerNumber":
            registerNumber?.trim()
        });

      if (!student) {
        return res.status(401).json({
          message:
            "Invalid register number or password."
        });
      }

      if (
        !student.passwordHash
      ) {
        return res.status(401).json({
          message:
            "Student account does not have a password."
        });
      }

      const validPassword =
        await bcrypt.compare(
          password || "",
          student.passwordHash
        );

      if (!validPassword) {
        return res.status(401).json({
          message:
            "Invalid register number or password."
        });
      }

      req.session.user = {
        role: "student",

        studentId:
          String(student._id),

        registerNumber:
          student.personal
            .registerNumber
      };

      return res.json({
        message:
          "Student login successful.",

        role: "student"
      });
    } catch (error) {
      console.error(
        "Student login error:",
        error
      );

      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   LOGOUT
========================================================= */

app.post(
  "/api/logout",
  (req, res) => {
    req.session.destroy(
      () => {
        res.json({
          message:
            "Logged out successfully."
        });
      }
    );
  }
);

/* =========================================================
   CURRENT LOGIN INFORMATION
========================================================= */

app.get(
  "/api/me",
  (req, res) => {
    return res.json({
      loggedIn:
        !!req.session.user,

      user:
        req.session.user ||
        null
    });
  }
);

/* =========================================================
   STUDENT - VIEW OWN PROFILE
========================================================= */

app.get(
  "/api/student/me",
  requireStudent,
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.session.user.studentId
        ).lean();

      if (!student) {
        return res.status(404).json({
          message:
            "Student profile not found."
        });
      }

      delete student.passwordHash;

      return res.json(student);
    } catch (error) {
      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   STUDENT - UPDATE OWN PROFILE
========================================================= */

app.put(
  "/api/student/me",
  requireStudent,
  async (req, res) => {
    try {
      const body = {
        ...req.body
      };

      delete body.passwordHash;

      delete body._id;

      delete body.__v;

      if (body.personal) {
        delete body.personal
          .registerNumber;
      }

      const student =
        await Student.findById(
          req.session.user.studentId
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student profile not found."
        });
      }

      Object.assign(
        student,
        body
      );

      student.personal
        .registerNumber =
        req.session.user
          .registerNumber;

      await student.save();

      const result =
        student.toObject();

      delete result.passwordHash;

      return res.json(result);
    } catch (error) {
      console.error(
        "Student profile update error:",
        error
      );

      return res.status(400).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - GET ALL STUDENTS
========================================================= */

app.get(
  "/api/students",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        search,
        department,
        section,
        category,
        careerGoal,
        minCgpa,
        arrearStatus
      } = req.query;

      const filter = {};

      if (department) {
        filter[
          "personal.department"
        ] = department;
      }

      if (section) {
        filter[
          "personal.section"
        ] = section;
      }

      if (category) {
        filter[
          "personal.category"
        ] = category;
      }

      if (careerGoal) {
        filter[
          "careerGoal.goal"
        ] = careerGoal;
      }

      if (search) {
        filter.$or = [
          {
            "personal.name": {
              $regex: search,
              $options: "i"
            }
          },

          {
            "personal.registerNumber": {
              $regex: search,
              $options: "i"
            }
          }
        ];
      }

      let students =
        await Student.find(filter)
          .sort({
            createdAt: -1
          })
          .lean();

      if (minCgpa) {
        students =
          students.filter(
            student => {
              const semesters =
                student.semesters ||
                [];

              const lastSemester =
                semesters[
                  semesters.length - 1
                ];

              return (
                lastSemester &&
                Number(
                  lastSemester.cgpa
                ) >=
                  Number(minCgpa)
              );
            }
          );
      }

      if (arrearStatus) {
        students =
          students.filter(
            student => {
              const hasPending =
                (
                  student.arrears ||
                  []
                ).some(
                  arrear =>
                    arrear.status ===
                    "Pending"
                );

              if (
                arrearStatus ===
                "Yes"
              ) {
                return hasPending;
              }

              return !hasPending;
            }
          );
      }

      return res.json(
        students
      );
    } catch (error) {
      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - GET ONE STUDENT
========================================================= */

app.get(
  "/api/students/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        ).lean();

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found."
        });
      }

      delete student.passwordHash;

      return res.json(student);
    } catch (error) {
      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - CREATE STUDENT
========================================================= */

app.post(
  "/api/students",
  requireAdmin,
  async (req, res) => {
    try {
      const body = {
        ...req.body
      };

      delete body.passwordHash;

      const student =
        await Student.create(
          body
        );

      const result =
        student.toObject();

      delete result.passwordHash;

      return res.status(201).json(
        result
      );
    } catch (error) {
      return res.status(400).json({
        message:
          error.code === 11000
            ? "Register number already exists."
            : error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - UPDATE STUDENT
========================================================= */

app.put(
  "/api/students/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const body = {
        ...req.body
      };

      delete body.passwordHash;

      const student =
        await Student.findByIdAndUpdate(
          req.params.id,

          body,

          {
            new: true,

            runValidators: true
          }
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found."
        });
      }

      const result =
        student.toObject();

      delete result.passwordHash;

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - DELETE STUDENT
========================================================= */

app.delete(
  "/api/students/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const student =
        await Student.findByIdAndDelete(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found."
        });
      }

      return res.json({
        message:
          "Student deleted successfully."
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - ADD SEMESTER
========================================================= */

app.post(
  "/api/students/:id/semesters",
  requireAdmin,
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found."
        });
      }

      student.semesters.push(
        req.body
      );

      await student.save();

      return res.json(student);
    } catch (error) {
      return res.status(400).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN - ADD ARREAR
========================================================= */

app.post(
  "/api/students/:id/arrears",
  requireAdmin,
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found."
        });
      }

      student.arrears.push(
        req.body
      );

      await student.save();

      return res.json(student);
    } catch (error) {
      return res.status(400).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN DASHBOARD INSIGHTS
========================================================= */

app.get(
  "/api/insights",
  requireAdmin,
  async (req, res) => {
    try {
      const students =
        await Student.find({})
          .lean();

      const total =
        students.length;

      const hostellers =
        students.filter(
          student =>
            student.personal
              ?.category ===
            "Hosteller"
        ).length;

      const dayScholars =
        students.filter(
          student =>
            student.personal
              ?.category ===
            "Day Scholar"
        ).length;

      const currentCgpas =
        students
          .map(student => {
            const semesters =
              student.semesters ||
              [];

            const last =
              semesters[
                semesters.length - 1
              ];

            return Number(
              last?.cgpa
            );
          })
          .filter(
            value =>
              Number.isFinite(value)
          );

      const average = values => {
        if (!values.length) {
          return "0.00";
        }

        const total =
          values.reduce(
            (a, b) =>
              a + b,
            0
          );

        return (
          total /
          values.length
        ).toFixed(2);
      };

      const subjects = {};

      let pendingArrears = 0;

      let clearedArrears = 0;

      let activeArrearStudents =
        0;

      let remedial = 0;

      students.forEach(
        student => {
          const arrears =
            student.arrears ||
            [];

          if (
            arrears.some(
              arrear =>
                arrear.status ===
                "Pending"
            )
          ) {
            activeArrearStudents++;
          }

          arrears.forEach(
            arrear => {
              if (
                arrear.status ===
                "Pending"
              ) {
                pendingArrears++;
              } else {
                clearedArrears++;
              }

              const subject =
                `${arrear.subjectCode || ""} - ${
                  arrear.subjectName || ""
                }`.trim();

              if (subject) {
                subjects[
                  subject
                ] =
                  (
                    subjects[
                      subject
                    ] || 0
                  ) + 1;
              }
            }
          );

          if (
            arrears.some(
              arrear =>
                arrear.remedialSupport ===
                "Yes"
            ) ||
            student.evaluation
              ?.mentorSupport
              ?.trim()
          ) {
            remedial++;
          }
        }
      );

      const subjectRanking =
        Object.entries(
          subjects
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 5);

      const improvement =
        students.filter(
          student => {
            const semesters =
              student.semesters ||
              [];

            if (
              semesters.length <
              2
            ) {
              return false;
            }

            return (
              Number(
                semesters[
                  semesters.length -
                    1
                ].sgpa
              ) >
              Number(
                semesters[
                  semesters.length -
                    2
                ].sgpa
              )
            );
          }
        ).length;

      const declined =
        students.filter(
          student => {
            const semesters =
              student.semesters ||
              [];

            if (
              semesters.length <
              2
            ) {
              return false;
            }

            return (
              Number(
                semesters[
                  semesters.length -
                    1
                ].sgpa
              ) <
              Number(
                semesters[
                  semesters.length -
                    2
                ].sgpa
              )
            );
          }
        ).length;

      const careerGoals = {
        Placement: 0,

        "Higher Studies": 0,

        Entrepreneurship: 0
      };

      students.forEach(
        student => {
          const goal =
            student.careerGoal
              ?.goal;

          if (
            careerGoals[
              goal
            ] !== undefined
          ) {
            careerGoals[
              goal
            ]++;
          }
        }
      );

      const missingProfiles =
        students.filter(
          student =>
            !student.technical
              ?.certifications
              ?.trim() ||
            !student.technical
              ?.projects
              ?.trim() ||
            !student.technical
              ?.github
              ?.trim() ||
            !student.technical
              ?.linkedin
              ?.trim()
        ).length;

      return res.json({
        total,

        hostellers,

        dayScholars,

        averageCurrentCgpa:
          average(
            currentCgpas
          ),

        highestCgpa:
          currentCgpas.length
            ? Math.max(
                ...currentCgpas
              ).toFixed(2)
            : "0.00",

        lowestCgpa:
          currentCgpas.length
            ? Math.min(
                ...currentCgpas
              ).toFixed(2)
            : "0.00",

        improvement,

        declined,

        activeArrearStudents,

        pendingArrears,

        clearedArrears,

        subjectRanking,

        remedial,

        missingProfiles,

        careerGoals
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    const databaseConnected =
      mongoose.connection
        .readyState === 1;

    return res.json({
      server: "running",

      database:
        databaseConnected
          ? "connected"
          : "disconnected",

      application:
        "Student Academic Personal and Career Profiling System"
    });
  }
);

/* =========================================================
   MONGODB CONNECTION
========================================================= */

async function connectDatabase() {
  const mongoURI =
    process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error("");
    console.error(
      "========================================"
    );

    console.error(
      "ERROR: MONGODB_URI is not configured."
    );

    console.error(
      "Add MONGODB_URI in ByteXL Nimbus Environment Variables."
    );

    console.error(
      "========================================"
    );

    console.error("");

    process.exit(1);
  }

  try {
    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "Student Academic Personal and Career"
    );

    console.log(
      "Profiling System"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(
      mongoURI,
      {
        serverSelectionTimeoutMS:
          10000
      }
    );

    console.log(
      "MongoDB connected successfully!"
    );

    console.log(
      "Database:",
      mongoose.connection.name
    );

    console.log(
      "MongoDB Host:",
      mongoose.connection.host
    );

    console.log(
      "========================================"
    );

    startApplication();

  } catch (error) {
    console.error("");

    console.error(
      "========================================"
    );

    console.error(
      "MongoDB connection failed!"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Reason:",
      error.message
    );

    console.error("");

    console.error(
      "Check MONGODB_URI in ByteXL Nimbus Environment Variables."
    );

    console.error("");

    process.exit(1);
  }
}

/* =========================================================
   START SERVER
========================================================= */

function startApplication() {
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Server running on port ${PORT}`
      );

      console.log(
        "Application started successfully."
      );

      console.log(
        "Student and Admin authentication enabled."
      );

      console.log(
        "========================================"
      );
    }
  );
}

/* =========================================================
   START APPLICATION
========================================================= */

connectDatabase();