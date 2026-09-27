STUDENT ACADEMIC, PERSONAL & CAREER PROFILING SYSTEM
===========================================================

PROJECT DESCRIPTION
-------------------
The Student Academic, Personal & Career Profiling System is a full-stack
web application for managing student personal, family, academic, technical,
self-evaluation, and career information in one centralized platform.

Students can maintain their profiles, semester records, arrear history,
technical skills, projects, certifications, internships, and career goals.

Administrators can securely manage student records, search and filter
students, monitor academic information, and view dashboard insights.

CAREER GOALS
------------
- Placement
- Higher Studies
- Entrepreneurship

MAIN FEATURES
-------------
STUDENT:
- Registration and login
- Secure password authentication
- Personal and family information
- Semester-wise SGPA, CGPA and attendance
- Arrear history
- Technical skills and programming languages
- Certifications and projects
- GitHub and LinkedIn profiles
- Hackathons and internships
- Self-evaluation
- Strengths and improvement areas
- Short-term and long-term goals
- Career goal selection

ADMIN:
- Secure admin login
- View all students
- Search by name or register number
- Filter by department, section, category, career goal,
  minimum CGPA and arrear status
- View, create, update and delete student records
- Add semester and arrear records
- View academic and career insights
- Identify remedial/mentor support requirements
- Identify incomplete technical profiles

DASHBOARD INSIGHTS
------------------
- Total students
- Hostellers and day scholars
- Average, highest and lowest CGPA
- Academic improvement and decline
- Active, pending and cleared arrears
- Common arrear subjects
- Remedial support requirements
- Incomplete profiles
- Career goal distribution

TECHNOLOGY STACK
----------------
Frontend: HTML5, CSS3, JavaScript, Bootstrap
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: Express Session, bcrypt.js
Tools: Git, GitHub, ByteXL Nimbus

PROJECT STRUCTURE
-----------------
student-academic-career-profiling-system/
|
|-- server.js
|-- package.json
|-- package-lock.json
|-- .gitignore
|-- README.md
|
|-- public/
|   |-- index.html
|   |-- admin.html
|   |-- student.html
|   |-- dashboard.html
|   |
|   |-- css/
|   |   |-- style.css
|   |
|   |-- js/
|       |-- ...
|
|-- .env              (LOCAL ONLY - DO NOT UPLOAD)

REQUIREMENTS
------------
Install the following before running the project:
1. Node.js
2. npm
3. MongoDB or access to a MongoDB server
4. Git (for cloning/updating the repository)

HOW TO SET UP THE PROJECT
-------------------------

STEP 1 - CLONE THE REPOSITORY
-----------------------------
Open a terminal and run:

git clone https://github.com/kaphin-raj-velu/student-academic-career-profiling-system.git

Then enter the project folder:

cd student-academic-career-profiling-system


STEP 2 - INSTALL DEPENDENCIES
-----------------------------
Run:

npm install

This installs all packages listed in package.json.


STEP 3 - CREATE THE ENVIRONMENT FILE
------------------------------------
Create a file named:

.env

in the root folder of the project.

The .env file is used for MongoDB credentials, admin credentials,
port configuration and session security.


STEP 4 - CONFIGURE ENVIRONMENT VARIABLES
----------------------------------------
Add the following to .env:

PORT=5000

MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

ADMIN_EMAIL=YOUR_ADMIN_EMAIL

ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD

SESSION_SECRET=YOUR_SECURE_SESSION_SECRET

Example format:

PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_secure_random_secret

IMPORTANT:
- Do not use the example values in a real deployment.
- Do not upload .env to GitHub.
- Never publish MongoDB passwords or admin passwords.
- Make sure .env is included in .gitignore.


STEP 5 - CONFIGURE MONGODB
--------------------------
The application requires MongoDB.

You can use:
- MongoDB Atlas
- A local MongoDB server
- An institutional MongoDB server
- Another compatible MongoDB hosting service

Put the MongoDB connection string in:

MONGODB_URI=your_connection_string

The actual connection string must remain private.


STEP 6 - START THE APPLICATION
------------------------------
Run:

npm start

If npm start is not configured in package.json, run:

node server.js


STEP 7 - CHECK THE TERMINAL
---------------------------
A successful startup should show messages similar to:

Student Academic Personal and Career Profiling System
Connecting to MongoDB...
MongoDB connected successfully!
Database: your_database
Server running on port 5000
Application started successfully.
Student and Admin authentication enabled.


STEP 8 - OPEN THE APPLICATION
-----------------------------
Open a browser and visit:

http://localhost:5000

If a different PORT is configured, replace 5000 with that port.


HEALTH CHECK
------------
Open:

http://localhost:5000/api/health

A successful response should contain:

{
  "server": "running",
  "database": "connected",
  "application": "Student Academic Personal and Career Profiling System"
}


STUDENT WORKFLOW
----------------
1. Register as a student.
2. Login using the register number and password.
3. Complete personal information.
4. Complete family information.
5. Add semester academic details.
6. Add arrear details if applicable.
7. Enter technical skills.
8. Add certifications and projects.
9. Add GitHub and LinkedIn information.
10. Complete self-evaluation.
11. Enter short-term and long-term goals.
12. Select the final career goal.
13. Save and update the profile.


ADMIN WORKFLOW
-------------
1. Login using the administrator credentials configured in .env.
2. Open the Admin Dashboard.
3. View student statistics.
4. Search or filter student records.
5. Open individual profiles.
6. Create, update or delete records when authorized.
7. Add semester and arrear information.
8. Review academic and career insights.
9. Identify students requiring mentoring or remedial support.


API ENDPOINTS
-------------
AUTHENTICATION
POST   /api/admin/login
POST   /api/student/register
POST   /api/student/login
POST   /api/logout
GET    /api/me

STUDENT
GET    /api/student/me
PUT    /api/student/me

ADMIN STUDENT MANAGEMENT
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id

ACADEMIC RECORDS
POST   /api/students/:id/semesters
POST   /api/students/:id/arrears

DASHBOARD
GET    /api/insights

HEALTH CHECK
GET    /api/health


DATABASE
--------
The application uses MongoDB with Mongoose.

Primary collection:

students

Student documents contain:
- Personal information
- Family information
- Semester records
- Arrear records
- Technical profile
- Self-evaluation
- Career goal information


SECURITY AND PRIVACY
--------------------
The application includes:
- Student authentication
- Admin authentication
- Password hashing using bcrypt
- Session-based authentication
- Role-based access control
- Protected APIs
- Environment-based credentials
- Password hashes excluded from API responses

IMPORTANT:
1. Never upload .env to GitHub.
2. Never publish MongoDB credentials.
3. Never publish administrator passwords.
4. Never hard-code production credentials in frontend files.
5. Use environment variables for sensitive configuration.
6. Use the application only for authorized academic purposes.


UPDATING THE PROJECT
--------------------
After making changes:

git add .

git commit -m "Update project"

git push


TROUBLESHOOTING
---------------
MONGODB CONNECTION ERROR:
- Check that MONGODB_URI exists in .env.
- Check MongoDB server availability.
- Check username and password.
- Check host and port.
- Check database access permissions.

ADMIN LOGIN ERROR:
Check these values in .env:

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

PORT ERROR:
If port 3000 is already in use, change:

PORT=3001

Then restart the server.

NPM START ERROR:
If npm start is not configured, run:

node server.js


PROJECT PURPOSE
---------------
The purpose of this system is to provide a centralized platform that
combines academic, personal, technical and career information.

It helps authorized faculty and mentors understand student progress
and identify areas requiring academic, technical, career or remedial
support.

This project is developed for academic and educational purposes.
