const $ = id => document.getElementById(id);


/* =========================================================
   API HELPER
========================================================= */

const api = async (
  url,
  options = {}
) => {

  const response =
    await fetch(
      url,
      {
        headers: {
          "Content-Type":
            "application/json"
        },

        ...options
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Request failed."
    );
  }

  return data;
};


/* =========================================================
   LOGIN TYPE
========================================================= */

function setLoginMode(mode) {

  const admin =
    mode === "admin";

  $("adminLoginForm")
    .classList
    .toggle(
      "d-none",
      !admin
    );

  $("studentLoginForm")
    .classList
    .toggle(
      "d-none",
      admin
    );

  $("studentRegisterForm")
    .classList
    .add("d-none");

  $("adminTabBtn").className =
    admin
      ? "btn btn-primary"
      : "btn btn-outline-primary";

  $("studentTabBtn").className =
    admin
      ? "btn btn-outline-primary"
      : "btn btn-primary";
}


$("adminTabBtn").onclick =
  () => setLoginMode("admin");


$("studentTabBtn").onclick =
  () => setLoginMode("student");


/* =========================================================
   STUDENT REGISTRATION SCREEN
========================================================= */

$("showRegisterBtn").onclick =
  () => {

    $("studentLoginForm")
      .classList
      .add("d-none");

    $("studentRegisterForm")
      .classList
      .remove("d-none");
  };


$("backToStudentLogin").onclick =
  () => {

    $("studentRegisterForm")
      .classList
      .add("d-none");

    $("studentLoginForm")
      .classList
      .remove("d-none");
  };


/* =========================================================
   CHECK LOGIN
========================================================= */

async function checkLogin() {

  try {

    const currentUser =
      await api("/api/me");


    /*
      Not logged in
    */

    $("loginView")
      .classList
      .toggle(
        "d-none",
        currentUser.loggedIn
      );

    $("appView")
      .classList
      .toggle(
        "d-none",
        !currentUser.loggedIn
      );


    if (!currentUser.loggedIn) {

      document.body.dataset.role =
        "";

      return;
    }


    const isAdmin =
      currentUser.user?.role ===
      "admin";


    /*
      IMPORTANT FIX:

      Store role in body dataset.
      The save form uses this value
      to determine whether the user
      is an admin or student.
    */

    document.body.dataset.role =
      isAdmin
        ? "admin"
        : "student";


    /*
      Admin / Student label
    */

    $("roleLabel").textContent =
      isAdmin
        ? `Admin: ${currentUser.user.email}`
        : `Student: ${currentUser.user.registerNumber}`;


    /*
      Admin tabs are hidden for students.
    */

    $("adminOnlyTabs")
      .classList
      .toggle(
        "d-none",
        !isAdmin
      );


    buildSemesters();


    if (isAdmin) {

      $("studentModeNote")
        .classList
        .add("d-none");

      loadStudents();

      loadDashboard();

    } else {

      $("studentModeNote")
        .classList
        .remove("d-none");

      await loadMyProfile();
    }

  } catch (error) {

    console.error(
      "Login check error:",
      error
    );
  }
}


/*
  Check session when page opens.
*/

checkLogin();


/* =========================================================
   ADMIN LOGIN
========================================================= */

$("adminLoginForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      try {

        await api(
          "/api/admin/login",
          {
            method: "POST",

            body:
              JSON.stringify({
                email:
                  $("adminEmail")
                    .value,

                password:
                  $("adminPassword")
                    .value
              })
          }
        );

        location.reload();

      } catch (error) {

        alert(
          error.message
        );
      }
    }
  );


/* =========================================================
   STUDENT LOGIN
========================================================= */

$("studentLoginForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      try {

        await api(
          "/api/student/login",
          {
            method: "POST",

            body:
              JSON.stringify({

                registerNumber:
                  $("studentRegNo")
                    .value,

                password:
                  $("studentPassword")
                    .value

              })
          }
        );

        location.reload();

      } catch (error) {

        alert(
          error.message
        );
      }
    }
  );


/* =========================================================
   STUDENT REGISTRATION
========================================================= */

$("studentRegisterForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      try {

        await api(
          "/api/student/register",
          {
            method: "POST",

            body:
              JSON.stringify({

                registerNumber:
                  $("registerRegNo")
                    .value,

                name:
                  $("registerName")
                    .value,

                password:
                  $("registerPassword")
                    .value

              })
          }
        );

        alert(
          "Student account created successfully."
        );

        location.reload();

      } catch (error) {

        alert(
          error.message
        );
      }
    }
  );


/* =========================================================
   LOGOUT
========================================================= */

$("logoutBtn").onclick =
  async () => {

    try {

      await api(
        "/api/logout",
        {
          method: "POST"
        }
      );

      location.reload();

    } catch (error) {

      alert(
        error.message
      );
    }
  };


/* =========================================================
   HOSTELLER / DAY SCHOLAR
========================================================= */

$("category").onchange =
  () => {

    const category =
      $("category").value;

    $("hostelWrap")
      .classList
      .toggle(
        "d-none",
        category !==
          "Hosteller"
      );

    $("distanceWrap")
      .classList
      .toggle(
        "d-none",
        category !==
          "Day Scholar"
      );
  };


/* =========================================================
   CAREER GOAL
========================================================= */

$("careerGoal").onchange =
  () => {

    const goal =
      $("careerGoal").value;

    $("placementFields")
      .classList
      .toggle(
        "d-none",
        goal !==
          "Placement"
      );

    $("higherFields")
      .classList
      .toggle(
        "d-none",
        goal !==
          "Higher Studies"
      );

    $("entrepreneurFields")
      .classList
      .toggle(
        "d-none",
        goal !==
          "Entrepreneurship"
      );
  };


/* =========================================================
   SEMESTERS
========================================================= */

function buildSemesters() {

  $("semesterRows")
    .innerHTML = "";

  for (
    let i = 1;
    i <= 8;
    i++
  ) {

    addSemesterRow(i);
  }
}


function addSemesterRow(number) {

  const row =
    document.createElement(
      "tr"
    );

  row.innerHTML = `

    <td>
      ${number}
    </td>

    <td>
      <input
        class="form-control sem-sgpa"
        type="number"
        step="0.01"
        min="0"
        max="10"
      >
    </td>

    <td>
      <input
        class="form-control sem-cgpa"
        type="number"
        step="0.01"
        min="0"
        max="10"
      >
    </td>

    <td>
      <input
        class="form-control sem-att"
        type="number"
        min="0"
        max="100"
      >
    </td>

    <td>

      <select
        class="form-select sem-arrear"
      >

        <option>No</option>
        <option>Yes</option>

      </select>

    </td>

    <td>

      <input
        class="form-control sem-count"
        type="number"
        min="0"
        value="0"
      >

    </td>

    <td>

      <input
        class="form-control sem-ach"
      >

    </td>

    <td>

      <input
        class="form-control sem-good"
      >

    </td>

  `;

  $("semesterRows")
    .appendChild(row);
}


$("addSemester").onclick =
  () => {

    const count =
      $("semesterRows")
        .children.length + 1;

    if (count <= 8) {

      addSemesterRow(
        count
      );
    }
  };


/* =========================================================
   ARREARS
========================================================= */

function addArrearRow(
  data = {}
) {

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "border rounded p-3 mb-2";


  div.innerHTML = `

    <button
      type="button"
      class="btn btn-sm btn-outline-danger remove-btn"
    >
      Remove
    </button>

    <div class="row g-2 mt-1">

      <div class="col-md-2">

        <label>
          Semester
        </label>

        <input
          class="form-control ar-sem"
          type="number"
          min="1"
          max="8"
          value="${data.semester || ""}"
        >

      </div>


      <div class="col-md-2">

        <label>
          Subject Code
        </label>

        <input
          class="form-control ar-code"
          value="${data.subjectCode || ""}"
        >

      </div>


      <div class="col-md-3">

        <label>
          Subject Name
        </label>

        <input
          class="form-control ar-name"
          value="${data.subjectName || ""}"
        >

      </div>


      <div class="col-md-2">

        <label>
          Attempts
        </label>

        <input
          class="form-control ar-attempts"
          type="number"
          min="1"
          value="${data.attempts || 1}"
        >

      </div>


      <div class="col-md-2">

        <label>
          Status
        </label>

        <select
          class="form-select ar-status"
        >

          <option
            ${
              data.status === "Pending"
                ? "selected"
                : ""
            }
          >
            Pending
          </option>

          <option
            ${
              data.status === "Cleared"
                ? "selected"
                : ""
            }
          >
            Cleared
          </option>

        </select>

      </div>


      <div class="col-md-3">

        <label>
          Cleared Semester
        </label>

        <input
          class="form-control ar-cleared-sem"
          type="number"
          min="1"
          max="8"
          value="${data.clearedSemester || ""}"
        >

      </div>


      <div class="col-md-2">

        <label>
          Grade
        </label>

        <input
          class="form-control ar-grade"
          value="${data.gradeAfterClearing || ""}"
        >

      </div>


      <div class="col-md-4">

        <label>
          Reason for Difficulty
        </label>

        <input
          class="form-control ar-reason"
          value="${data.reason || ""}"
        >

      </div>


      <div class="col-md-3">

        <label>
          Remedial Support
        </label>

        <select
          class="form-select ar-remedial"
        >

          <option
            ${
              data.remedialSupport !== "Yes"
                ? "selected"
                : ""
            }
          >
            No
          </option>

          <option
            ${
              data.remedialSupport === "Yes"
                ? "selected"
                : ""
            }
          >
            Yes
          </option>

        </select>

      </div>

    </div>

  `;


  div
    .querySelector(
      ".remove-btn"
    )
    .onclick =
      () => div.remove();


  $("arrearRows")
    .appendChild(div);
}


$("addArrear").onclick =
  () => addArrearRow();


/* =========================================================
   FORM VALUE
========================================================= */

function val(id) {

  const element =
    $(id);

  if (!element) {
    return "";
  }

  return element.value.trim();
}


/* =========================================================
   COLLECT COMPLETE PROFILE
========================================================= */

function collect() {

  const semesters =
    [
      ...document.querySelectorAll(
        "#semesterRows tr"
      )
    ]

      .map(row => {

        return {

          semesterNumber:
            Number(
              row.children[0]
                .textContent
            ),

          sgpa:
            Number(
              row.querySelector(
                ".sem-sgpa"
              ).value
            ) || 0,

          cgpa:
            Number(
              row.querySelector(
                ".sem-cgpa"
              ).value
            ) || 0,

          attendance:
            Number(
              row.querySelector(
                ".sem-att"
              ).value
            ) || 0,

          arrearStatus:
            row.querySelector(
              ".sem-arrear"
            ).value,

          numberOfArrears:
            Number(
              row.querySelector(
                ".sem-count"
              ).value
            ) || 0,

          academicAchievements:
            row.querySelector(
              ".sem-ach"
            ).value,

          goodSubjects:
            row.querySelector(
              ".sem-good"
            ).value

        };

      })

      .filter(
        semester =>
          semester.sgpa ||
          semester.cgpa ||
          semester.attendance ||
          semester.arrearStatus ===
            "Yes" ||
          semester.numberOfArrears ||
          semester.academicAchievements ||
          semester.goodSubjects
      );


  const arrears =
    [
      ...document.querySelectorAll(
        "#arrearRows > div"
      )
    ].map(div => {

      return {

        semester:
          Number(
            div.querySelector(
              ".ar-sem"
            ).value
          ) || 0,

        subjectCode:
          div.querySelector(
            ".ar-code"
          ).value,

        subjectName:
          div.querySelector(
            ".ar-name"
          ).value,

        attempts:
          Number(
            div.querySelector(
              ".ar-attempts"
            ).value
          ) || 1,

        status:
          div.querySelector(
            ".ar-status"
          ).value,

        clearedSemester:
          Number(
            div.querySelector(
              ".ar-cleared-sem"
            ).value
          ) || undefined,

        gradeAfterClearing:
          div.querySelector(
            ".ar-grade"
          ).value,

        reason:
          div.querySelector(
            ".ar-reason"
          ).value,

        remedialSupport:
          div.querySelector(
            ".ar-remedial"
          ).value

      };

    });


  return {

    personal: {

      registerNumber:
        val("regNo"),

      name:
        val("name"),

      dob:
        val("dob"),

      gender:
        val("gender"),

      department:
        val("department"),

      section:
        val("section"),

      institutionalEmail:
        val("instEmail"),

      personalEmail:
        val("personalEmail"),

      mobile:
        val("mobile"),

      address:
        val("address"),

      category:
        val("category"),

      hostelName:
        val("hostelName"),

      distance:
        Number(
          val("distance")
        ) || undefined

    },


    family: {

      fatherName:
        val("fatherName"),

      fatherOccupation:
        val("fatherOccupation"),

      fatherIncome:
        val("fatherIncome"),

      fatherMobile:
        val("fatherMobile"),

      motherName:
        val("motherName"),

      motherOccupation:
        val("motherOccupation"),

      motherIncome:
        val("motherIncome"),

      motherMobile:
        val("motherMobile"),

      guardianName:
        val("guardianName"),

      emergencyContact:
        val("emergencyContact"),

      firstGeneration:
        val("firstGeneration"),

      scholarship:
        val("scholarship"),

      financialGuidance:
        val("financialGuidance")

    },


    semesters,


    arrears,


    technical: {

      programmingLanguages:
        val("languages"),

      skills:
        val("skills"),

      areaOfInterest:
        val("interest"),

      preferredDomain:
        val("domain"),

      certifications:
        val("certifications"),

      projects:
        val("projects"),

      projectGithub:
        val("projectGithub"),

      hackathons:
        val("hackathons"),

      internship:
        val("internship"),

      github:
        val("github"),

      linkedin:
        val("linkedin"),

      hackerRank:
        val("hackerRank"),

      hackerEarth:
        val("hackerEarth"),

      communicationLevel:
        val("communicationLevel"),

      aptitudeLevel:
        val("aptitudeLevel")

    },


    evaluation: {

      academicStrengths:
        val("academicStrengths"),

      technicalStrengths:
        val("technicalStrengths"),

      communicationStrengths:
        val("communicationStrengths"),

      leadershipTeamwork:
        val("leadershipTeamwork"),

      improvementAreas:
        val("improvementAreas"),

      supportSubjects:
        val("supportSubjects"),

      skillsToDevelop:
        val("skillsToDevelop"),

      communicationAptitudeImprove:
        val(
          "communicationAptitudeImprove"
        ),

      mentorSupport:
        val("mentorSupport"),

      shortTermGoal:
        val("shortTermGoal"),

      longTermGoal:
        val("longTermGoal")

    },


    careerGoal: {

      goal:
        val("careerGoal"),

      placement: {

        jobRole:
          val("jobRole"),

        domain:
          val("placementDomain"),

        companyType:
          val("companyType"),

        salaryRange:
          val("salaryRange"),

        location:
          val("preferredLocation"),

        targetCompanies:
          val("targetCompanies"),

        support:
          val("placementSupport")

      },


      higherStudies: {

        programme:
          val("programme"),

        specialization:
          val("specialization"),

        country:
          val("country"),

        institutions:
          val("institutions"),

        exams:
          val("exams"),

        admissionYear:
          Number(
            val("admissionYear")
          ) || undefined,

        guidance:
          val("higherGuidance")

      },


      entrepreneurship: {

        businessIdea:
          val("businessIdea"),

        problem:
          val("problemAddressed"),

        solution:
          val("solution"),

        customers:
          val("targetCustomers"),

        stage:
          val("stage"),

        teamTech:
          val("teamTech"),

        funding:
          val("funding"),

        launchYear:
          Number(
            val("launchYear")
          ) || undefined

      }

    }

  };
}


/* =========================================================
   SAVE STUDENT PROFILE
========================================================= */

$("studentForm")
  .onsubmit =
  async event => {

    event.preventDefault();


    if (
      !$("regNo").value.trim() ||
      !$("name").value.trim()
    ) {

      alert(
        "Register number and student name are required."
      );

      return;
    }


    /*
      IMPORTANT:

      Student -> /api/student/me
      Admin   -> /api/students/:id
    */

    const role =
      document.body.dataset.role;


    const isStudent =
      role === "student";


    const id =
      $("studentId").value;


    try {

      let url;

      let method;


      if (isStudent) {

        url =
          "/api/student/me";

        method =
          "PUT";

      } else if (id) {

        url =
          `/api/students/${id}`;

        method =
          "PUT";

      } else {

        url =
          "/api/students";

        method =
          "POST";
      }


      await api(
        url,
        {
          method,

          body:
            JSON.stringify(
              collect()
            )
        }
      );


      alert(
        isStudent
          ? "Your profile was updated successfully."
          : id
            ? "Student updated successfully."
            : "Student saved successfully."
      );


      if (isStudent) {

        await loadMyProfile();

      } else {

        resetForm();

        loadStudents();

        loadDashboard();
      }

    } catch (error) {

      alert(
        error.message
      );
    }
  };


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

  $("studentForm").reset();

  $("studentId").value =
    "";

  $("arrearRows")
    .innerHTML = "";

  buildSemesters();

  $("hostelWrap")
    .classList
    .add("d-none");

  $("distanceWrap")
    .classList
    .add("d-none");

  $("placementFields")
    .classList
    .add("d-none");

  $("higherFields")
    .classList
    .add("d-none");

  $("entrepreneurFields")
    .classList
    .add("d-none");
}


$("resetBtn").onclick =
  resetForm;


/* =========================================================
   LOAD STUDENT'S OWN PROFILE
========================================================= */

async function loadMyProfile() {

  try {

    const student =
      await api(
        "/api/student/me"
      );

    fillForm(student);

    $("studentId").value =
      student._id || "";

  } catch (error) {

    alert(
      error.message
    );
  }
}


/* =========================================================
   ADMIN - LOAD STUDENTS
========================================================= */

async function loadStudents() {

  const params =
    new URLSearchParams();


  if (
    val("search")
  ) {
    params.set(
      "search",
      val("search")
    );
  }


  if (
    val("filterDept")
  ) {
    params.set(
      "department",
      val("filterDept")
    );
  }


  if (
    val("filterSection")
  ) {
    params.set(
      "section",
      val("filterSection")
    );
  }


  if (
    val("filterGoal")
  ) {
    params.set(
      "careerGoal",
      val("filterGoal")
    );
  }


  if (
    val("filterCategory")
  ) {
    params.set(
      "category",
      val("filterCategory")
    );
  }


  try {

    const students =
      await api(
        "/api/students?" +
        params.toString()
      );


    $("studentTable")
      .innerHTML =
      students.map(
        student => {

          const semesters =
            student.semesters || [];

          const last =
            semesters[
              semesters.length - 1
            ];

          const pending =
            (
              student.arrears || []
            ).some(
              arrear =>
                arrear.status ===
                "Pending"
            );


          return `

            <tr>

              <td>
                ${
                  student.personal
                    .registerNumber
                }
              </td>

              <td>
                ${
                  student.personal
                    .name
                }
              </td>

              <td>
                ${
                  student.personal
                    .department || ""
                }
              </td>

              <td>
                ${
                  student.personal
                    .section || ""
                }
              </td>

              <td>
                ${
                  last?.cgpa || "-"
                }
              </td>

              <td>
                ${
                  student.careerGoal?.goal ||
                  "-"
                }
              </td>

              <td>
                ${
                  pending
                    ? "Yes"
                    : "No"
                }
              </td>

              <td>

                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  onclick="editStudent('${student._id}')"
                >
                  Edit
                </button>

                <button
                  class="btn btn-sm btn-outline-danger"
                  onclick="deleteStudent('${student._id}')"
                >
                  Delete
                </button>

              </td>

            </tr>

          `;
        }
      ).join("");


    if (!students.length) {

      $("studentTable")
        .innerHTML = `

          <tr>

            <td
              colspan="8"
              class="text-center"
            >
              No students found.
            </td>

          </tr>

        `;
    }

  } catch (error) {

    alert(
      error.message
    );
  }
}


$("filterBtn").onclick =
  loadStudents;


/* =========================================================
   ADMIN DELETE
========================================================= */

window.deleteStudent =
  async id => {

    const confirmed =
      confirm(
        "Delete this student profile? This cannot be undone."
      );


    if (!confirmed) {
      return;
    }


    try {

      await api(
        "/api/students/" +
        id,
        {
          method:
            "DELETE"
        }
      );

      loadStudents();

      loadDashboard();

    } catch (error) {

      alert(
        error.message
      );
    }
  };


/* =========================================================
   ADMIN EDIT
========================================================= */

window.editStudent =
  async id => {

    try {

      const student =
        await api(
          "/api/students/" +
          id
        );

      fillForm(student);

      document
        .querySelector(
          '[data-bs-target="#formTab"]'
        )
        .click();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {

      alert(
        error.message
      );
    }
  };


/* =========================================================
   FILL INPUT
========================================================= */

function fill(
  id,
  value
) {

  if ($(id)) {

    $(id).value =
      value ?? "";
  }
}


/* =========================================================
   FILL COMPLETE PROFILE
========================================================= */

function fillForm(student) {

  const personal =
    student.personal || {};

  const family =
    student.family || {};

  const technical =
    student.technical || {};

  const evaluation =
    student.evaluation || {};


  fill(
    "studentId",
    student._id
  );

  fill(
    "regNo",
    personal.registerNumber
  );

  fill(
    "name",
    personal.name
  );

  fill(
    "dob",
    personal.dob
  );

  fill(
    "gender",
    personal.gender
  );

  fill(
    "department",
    personal.department
  );

  fill(
    "section",
    personal.section
  );

  fill(
    "instEmail",
    personal.institutionalEmail
  );

  fill(
    "personalEmail",
    personal.personalEmail
  );

  fill(
    "mobile",
    personal.mobile
  );

  fill(
    "address",
    personal.address
  );

  fill(
    "category",
    personal.category
  );

  fill(
    "hostelName",
    personal.hostelName
  );

  fill(
    "distance",
    personal.distance
  );


  $("category")
    .dispatchEvent(
      new Event("change")
    );


  /* FAMILY */

  fill(
    "fatherName",
    family.fatherName
  );

  fill(
    "fatherOccupation",
    family.fatherOccupation
  );

  fill(
    "fatherIncome",
    family.fatherIncome
  );

  fill(
    "fatherMobile",
    family.fatherMobile
  );

  fill(
    "motherName",
    family.motherName
  );

  fill(
    "motherOccupation",
    family.motherOccupation
  );

  fill(
    "motherIncome",
    family.motherIncome
  );

  fill(
    "motherMobile",
    family.motherMobile
  );

  fill(
    "guardianName",
    family.guardianName
  );

  fill(
    "emergencyContact",
    family.emergencyContact
  );

  fill(
    "firstGeneration",
    family.firstGeneration
  );

  fill(
    "scholarship",
    family.scholarship
  );

  fill(
    "financialGuidance",
    family.financialGuidance
  );


  /* SEMESTERS */

  buildSemesters();


  (
    student.semesters || []
  ).forEach(
    semester => {

      const row =
        [
          ...document.querySelectorAll(
            "#semesterRows tr"
          )
        ][
          semester.semesterNumber - 1
        ];


      if (!row) {
        return;
      }


      row.querySelector(
        ".sem-sgpa"
      ).value =
        semester.sgpa || "";


      row.querySelector(
        ".sem-cgpa"
      ).value =
        semester.cgpa || "";


      row.querySelector(
        ".sem-att"
      ).value =
        semester.attendance || "";


      row.querySelector(
        ".sem-arrear"
      ).value =
        semester.arrearStatus ||
        "No";


      row.querySelector(
        ".sem-count"
      ).value =
        semester.numberOfArrears ||
        0;


      row.querySelector(
        ".sem-ach"
      ).value =
        semester.academicAchievements ||
        "";


      row.querySelector(
        ".sem-good"
      ).value =
        semester.goodSubjects ||
        "";
    }
  );


  /* ARREARS */

  $("arrearRows")
    .innerHTML = "";


  (
    student.arrears || []
  ).forEach(
    arrear =>
      addArrearRow(
        arrear
      )
  );


  /* TECHNICAL */

  fill(
    "languages",
    technical.programmingLanguages
  );

  fill(
    "skills",
    technical.skills
  );

  fill(
    "interest",
    technical.areaOfInterest
  );

  fill(
    "domain",
    technical.preferredDomain
  );

  fill(
    "certifications",
    technical.certifications
  );

  fill(
    "projects",
    technical.projects
  );

  fill(
    "projectGithub",
    technical.projectGithub
  );

  fill(
    "hackathons",
    technical.hackathons
  );

  fill(
    "internship",
    technical.internship
  );

  fill(
    "github",
    technical.github
  );

  fill(
    "linkedin",
    technical.linkedin
  );

  fill(
    "hackerRank",
    technical.hackerRank
  );

  fill(
    "hackerEarth",
    technical.hackerEarth
  );

  fill(
    "communicationLevel",
    technical.communicationLevel
  );

  fill(
    "aptitudeLevel",
    technical.aptitudeLevel
  );


  /* SELF EVALUATION */

  const evaluationFields = {

    academicStrengths:
      evaluation.academicStrengths,

    technicalStrengths:
      evaluation.technicalStrengths,

    communicationStrengths:
      evaluation.communicationStrengths,

    leadershipTeamwork:
      evaluation.leadershipTeamwork,

    improvementAreas:
      evaluation.improvementAreas,

    supportSubjects:
      evaluation.supportSubjects,

    skillsToDevelop:
      evaluation.skillsToDevelop,

    communicationAptitudeImprove:
      evaluation.communicationAptitudeImprove,

    mentorSupport:
      evaluation.mentorSupport,

    shortTermGoal:
      evaluation.shortTermGoal,

    longTermGoal:
      evaluation.longTermGoal

  };


  Object.entries(
    evaluationFields
  ).forEach(
    ([id, value]) =>
      fill(id, value)
  );


  /* CAREER GOAL */

  fill(
    "careerGoal",
    student.careerGoal?.goal
  );


  $("careerGoal")
    .dispatchEvent(
      new Event("change")
    );


  const career =
    student.careerGoal || {};

  const placement =
    career.placement || {};

  const higherStudies =
    career.higherStudies || {};

  const entrepreneurship =
    career.entrepreneurship || {};


  const careerFields = [

    [
      "jobRole",
      placement.jobRole
    ],

    [
      "placementDomain",
      placement.domain
    ],

    [
      "companyType",
      placement.companyType
    ],

    [
      "salaryRange",
      placement.salaryRange
    ],

    [
      "preferredLocation",
      placement.location
    ],

    [
      "targetCompanies",
      placement.targetCompanies
    ],

    [
      "placementSupport",
      placement.support
    ],

    [
      "programme",
      higherStudies.programme
    ],

    [
      "specialization",
      higherStudies.specialization
    ],

    [
      "country",
      higherStudies.country
    ],

    [
      "institutions",
      higherStudies.institutions
    ],

    [
      "exams",
      higherStudies.exams
    ],

    [
      "admissionYear",
      higherStudies.admissionYear
    ],

    [
      "higherGuidance",
      higherStudies.guidance
    ],

    [
      "businessIdea",
      entrepreneurship.businessIdea
    ],

    [
      "problemAddressed",
      entrepreneurship.problem
    ],

    [
      "solution",
      entrepreneurship.solution
    ],

    [
      "targetCustomers",
      entrepreneurship.customers
    ],

    [
      "stage",
      entrepreneurship.stage
    ],

    [
      "teamTech",
      entrepreneurship.teamTech
    ],

    [
      "funding",
      entrepreneurship.funding
    ],

    [
      "launchYear",
      entrepreneurship.launchYear
    ]

  ];


  careerFields.forEach(
    ([id, value]) =>
      fill(id, value)
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

async function loadDashboard() {

  try {

    const data =
      await api(
        "/api/insights"
      );


    const cards = [

      [
        "Total Students",
        data.total
      ],

      [
        "Hostellers",
        data.hostellers
      ],

      [
        "Day Scholars",
        data.dayScholars
      ],

      [
        "Average Current CGPA",
        data.averageCurrentCgpa
      ],

      [
        "Highest CGPA",
        data.highestCgpa
      ],

      [
        "Lowest CGPA",
        data.lowestCgpa
      ],

      [
        "Improving SGPA",
        data.improvement
      ],

      [
        "Declining SGPA",
        data.declined
      ],

      [
        "Active Arrear Students",
        data.activeArrearStudents
      ],

      [
        "Pending Arrears",
        data.pendingArrears
      ],

      [
        "Cleared Arrears",
        data.clearedArrears
      ],

      [
        "Need Remedial Support",
        data.remedial
      ],

      [
        "Missing Certification/Project/Profile",
        data.missingProfiles
      ]

    ];


    $("dashboard")
      .innerHTML =

      cards.map(
        card => `

          <div class="col-md-3">

            <div class="metric">

              <small
                class="text-muted"
              >
                ${card[0]}
              </small>

              <h3>
                ${card[1]}
              </h3>

            </div>

          </div>

        `
      ).join("")


      +

      `

      <div class="col-md-6">

        <div class="metric">

          <h5>
            Career Goals
          </h5>

          <p>

            Placement:
            <b>
              ${data.careerGoals.Placement}
            </b>

            &nbsp;&nbsp;

            Higher Studies:
            <b>
              ${data.careerGoals["Higher Studies"]}
            </b>

            &nbsp;&nbsp;

            Entrepreneurship:
            <b>
              ${data.careerGoals.Entrepreneurship}
            </b>

          </p>

        </div>

      </div>


      <div class="col-md-6">

        <div class="metric">

          <h5>
            Top Arrear Subjects
          </h5>

          ${
            data.subjectRanking.length

              ? data.subjectRanking
                  .map(
                    item =>
                      `<div>
                        ${item[0]}
                        —
                        <b>${item[1]}</b>
                      </div>`
                  )
                  .join("")

              : "<div>No arrear data</div>"
          }

        </div>

      </div>

      `;

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );
  }
}