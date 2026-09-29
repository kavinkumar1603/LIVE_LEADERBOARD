# Live Coding Challenge Platform --- Complete Architecture & Implementation Plan

## 1. Project Overview

The platform is a coding-question assessment system for first-year
students.

### Main requirements

-   Separate login for first-year students.
-   Students receive coding questions randomly.
-   Each student can solve assigned questions.
-   After solving, the student captures a screenshot of the code/output.
-   The screenshot is uploaded to the backend.
-   Admin/reviewer evaluates each submitted question independently.
-   Marks can be given separately for every question.
-   Student total score is calculated automatically.
-   Leaderboard updates live whenever marks change.
-   Students can see their own progress and leaderboard position.
-   Admin can manage students, questions, submissions, marks, and
    leaderboard.
-   MongoDB stores users, questions, submissions, marks, and image
    metadata/files.
-   Next.js is used for the frontend.
-   Node.js/Express is used for the backend.

------------------------------------------------------------------------


# 1A. Critical Requirement — Runtime Individual Marking

The system must support **live marking of an individual student's individual question while the assessment/result session is running**.

The admin can select:

```text
Student → Question → Submission → Marks
```

and award or modify marks immediately.

The backend must then:

```text
1. Validate the admin.
2. Validate the student and submission.
3. Validate that the question belongs to the student's assignment.
4. Validate that marks are between 0 and the question's maximum marks.
5. Create or update the evaluation.
6. Recalculate the student's total score.
7. Recalculate the affected leaderboard ranks.
8. Save the updated leaderboard state.
9. Emit a real-time event for the affected student.
10. Emit a real-time leaderboard event to connected clients.
11. Record the mark change in an audit log.
```

### Runtime Marking Principle

```text
ADMIN AWARDS MARKS
       │
       ▼
NODE.JS API
       │
       ├── Validate admin
       ├── Validate submission
       ├── Validate marks
       │
       ▼
MONGODB
Evaluation Created/Updated
       │
       ▼
Score Calculation
       │
       ▼
Leaderboard Calculation
       │
       ├───────────────┐
       ▼               ▼
Student Socket      Leaderboard Socket
       │               │
       ▼               ▼
Student Score       All Connected
Updated LIVE        Leaderboards
```

There must be **no requirement for a page refresh**.

# 2. Recommended Technology Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Axios or Fetch API
-   Socket.IO Client
-   React Hook Form
-   Zod
-   Recharts (optional for admin analytics)

## Backend

-   Node.js
-   Express.js
-   TypeScript
-   Socket.IO
-   JWT authentication
-   bcrypt/argon2 for password hashing
-   Multer for multipart upload handling
-   Sharp for image validation/resizing (optional)

## Database

-   MongoDB
-   Mongoose

## Image Storage

### Recommended production architecture

Do **not** store large image binaries directly inside normal MongoDB
documents.

Recommended:

``` text
Student
   |
   v
Next.js
   |
   v
Node.js API
   |
   +----> MongoDB
   |       - Users
   |       - Questions
   |       - Attempts
   |       - Marks
   |       - Leaderboard data
   |
   +----> Object Storage
           - Submission screenshots
```

Possible object-storage options:

-   Cloudinary
-   AWS S3
-   Cloudflare R2
-   Supabase Storage

If MongoDB storage is mandatory, use MongoDB GridFS for screenshots.

For the first version, MongoDB + GridFS can work, but object storage is
easier to scale.

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
                           ┌─────────────────────┐
                           │      Students       │
                           │  First-Year Users   │
                           └──────────┬──────────┘
                                      │
                                      │ HTTPS
                                      ▼
                         ┌────────────────────────┐
                         │      Next.js Frontend  │
                         │                        │
                         │ Login                 │
                         │ Dashboard             │
                         │ Question UI            │
                         │ Submission             │
                         │ Leaderboard             │
                         └────────────┬───────────┘
                                      │
                           REST API + WebSocket
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │   Node.js / Express    │
                         │                        │
                         │ Authentication         │
                         │ Question Engine        │
                         │ Submission Service     │
                         │ Evaluation Service     │
                         │ Leaderboard Service    │
                         │ Admin Service          │
                         │ Socket.IO              │
                         └───────┬─────────┬──────┘
                                 │         │
                       ┌─────────┘         └──────────┐
                       ▼                              ▼
              ┌────────────────┐             ┌────────────────┐
              │    MongoDB     │             │ Image Storage  │
              │                │             │                │
              │ Users          │             │ Screenshots    │
              │ Questions      │             │                │
              │ Attempts       │             └────────────────┘
              │ Marks          │
              │ Leaderboard    │
              └────────────────┘
```

------------------------------------------------------------------------

# 4. User Roles

The platform should initially have two major roles.

## Student

Capabilities:

-   Login
-   View assigned questions
-   Solve questions
-   Submit screenshot
-   View submission status
-   View marks after evaluation
-   View total score
-   View leaderboard
-   View rank
-   Logout

## Admin

Capabilities:

-   Login
-   Add/edit/delete questions
-   Import questions
-   Create/manage students
-   View all submissions
-   View submitted screenshots
-   Evaluate submissions
-   Give marks per question
-   Add comments/feedback
-   Modify marks if required
-   View student performance
-   View live leaderboard
-   Export results
-   Lock/unlock assessment

------------------------------------------------------------------------

# 5. Complete User Flow

## Student Flow

``` text
Student
   |
   v
Login
   |
   v
Authentication
   |
   v
Student Dashboard
   |
   v
Assessment Started?
   |
   +---- NO ---> Waiting Screen
   |
   +---- YES
          |
          v
   Generate Random Questions
          |
          v
   Question 1
          |
          v
   Solve Question
          |
          v
   Capture Code Screenshot
          |
          v
   Upload Screenshot
          |
          v
   Submission Created
          |
          v
   Question Completed
          |
          v
   Next Question
          |
          v
   All Questions Completed
          |
          v
   Waiting for Evaluation
          |
          v
   Admin Gives Marks
          |
          v
   Score Updated
          |
          v
   Leaderboard Updated
          |
          v
   Student Sees New Rank
```

------------------------------------------------------------------------

# 6. Admin Flow

``` text
Admin
  |
  v
Admin Login
  |
  v
Admin Dashboard
  |
  +-----------------------+
  |                       |
  v                       v
Questions             Submissions
  |                       |
  v                       v
Manage Questions      Select Student
                          |
                          v
                    View Question
                          |
                          v
                    View Screenshot
                          |
                          v
                    Enter Marks
                          |
                          v
                    Add Feedback
                          |
                          v
                    Save Evaluation
                          |
                          v
                  Recalculate Score
                          |
                          v
                  Emit Leaderboard
                          |
                          v
                   Live Update
```

------------------------------------------------------------------------

# 7. Assessment Lifecycle

Use an explicit assessment state.

``` text
DRAFT
  |
  v
READY
  |
  v
LIVE
  |
  v
ENDED
  |
  v
RESULT_PUBLISHED
```

## DRAFT

Admin is preparing questions.

## READY

Questions and students are ready.

## LIVE

Students can log in and submit.

## ENDED

No more submissions are accepted.

## RESULT_PUBLISHED

Final leaderboard is visible.

This prevents students from submitting after the event has ended.

------------------------------------------------------------------------

# 8. Question Randomization

This is one of the most important parts.

Do not randomly generate a question every time the student refreshes the
page.

Instead:

``` text
Assessment Start
       |
       v
Generate student's question set
       |
       v
Save assigned questions in DB
       |
       v
Student opens Question 1
       |
       v
Refresh page
       |
       v
Same Question 1
```

## Example

Question pool:

``` text
Q1 - Variables
Q2 - Loops
Q3 - Arrays
Q4 - Functions
Q5 - Strings
Q6 - Patterns
Q7 - Sorting
Q8 - Searching
Q9 - OOP
Q10 - Recursion
```

If each student gets 5 questions:

``` text
Student A:
Q2, Q5, Q7, Q1, Q9

Student B:
Q4, Q1, Q8, Q3, Q10

Student C:
Q6, Q2, Q9, Q5, Q3
```

The generated assignment must be stored.

------------------------------------------------------------------------

# 9. Better Randomization Strategy

Use question categories/difficulty.

Example:

``` text
Easy       = 40 questions
Medium     = 30 questions
Hard       = 10 questions
```

For a 5-question assessment:

``` text
2 Easy
2 Medium
1 Hard
```

This produces more balanced assessments.

Database fields:

``` text
category
difficulty
topic
marks
active
```

------------------------------------------------------------------------

# 10. Prevent Duplicate Questions

When generating a student's question set:

``` text
1. Fetch active questions
2. Filter by required difficulty
3. Randomize
4. Select required number
5. Store question IDs
6. Never regenerate automatically
```

MongoDB can use aggregation `$sample`, or the backend can use a
controlled randomization algorithm.

------------------------------------------------------------------------

# 11. Database Architecture

Recommended collections:

``` text
users
questions
assessments
student_assignments
submissions
evaluations
leaderboard
audit_logs
```

------------------------------------------------------------------------

# 12. Users Collection

Example:

``` json
{
  "_id": "ObjectId",
  "studentId": "23CSE001",
  "name": "Student Name",
  "email": "student@example.com",
  "passwordHash": "...",
  "role": "student",
  "year": 1,
  "department": "CSE",
  "section": "B",
  "isActive": true,
  "createdAt": "date",
  "updatedAt": "date"
}
```

Admin:

``` json
{
  "_id": "ObjectId",
  "email": "admin@example.com",
  "passwordHash": "...",
  "role": "admin",
  "isActive": true
}
```

Never store plain-text passwords.

------------------------------------------------------------------------

# 13. Questions Collection

``` json
{
  "_id": "ObjectId",
  "title": "Find Maximum Element",
  "description": "Write a program to find...",
  "language": "C++",
  "difficulty": "easy",
  "category": "arrays",
  "marks": 10,
  "timeLimit": 15,
  "active": true,
  "createdBy": "adminId",
  "createdAt": "date"
}
```

Optional:

``` json
{
  "inputFormat": "...",
  "outputFormat": "...",
  "constraints": "...",
  "sampleInput": "...",
  "sampleOutput": "..."
}
```

------------------------------------------------------------------------

# 14. Assessments Collection

``` json
{
  "_id": "ObjectId",
  "name": "First Year Coding Challenge",
  "description": "First year programming assessment",
  "totalQuestions": 5,
  "durationMinutes": 60,
  "status": "LIVE",
  "startsAt": "date",
  "endsAt": "date",
  "createdBy": "adminId"
}
```

------------------------------------------------------------------------

# 15. Student Assignment Collection

This collection connects a student to their randomly selected questions.

``` json
{
  "_id": "ObjectId",
  "assessmentId": "ObjectId",
  "studentId": "ObjectId",
  "questions": [
    {
      "questionId": "ObjectId",
      "order": 1,
      "status": "completed"
    },
    {
      "questionId": "ObjectId",
      "order": 2,
      "status": "pending"
    }
  ],
  "startedAt": "date",
  "completedAt": "date"
}
```

This is essential for deterministic question assignment.

------------------------------------------------------------------------

# 16. Submission Collection

Every question submission should have its own record.

``` json
{
  "_id": "ObjectId",
  "assessmentId": "ObjectId",
  "studentId": "ObjectId",
  "questionId": "ObjectId",
  "screenshotUrl": "...",
  "storageKey": "...",
  "submittedAt": "date",
  "status": "submitted",
  "attemptNumber": 1
}
```

Possible statuses:

``` text
NOT_SUBMITTED
SUBMITTED
UNDER_REVIEW
EVALUATED
REJECTED
```

------------------------------------------------------------------------

# 17. Evaluation Collection

Marks should be stored separately from submission data.

``` json
{
  "_id": "ObjectId",
  "submissionId": "ObjectId",
  "studentId": "ObjectId",
  "questionId": "ObjectId",
  "marksObtained": 8,
  "maximumMarks": 10,
  "feedback": "Good logic. Improve edge-case handling.",
  "evaluatedBy": "adminId",
  "evaluatedAt": "date"
}
```

This makes auditing and mark changes easier.

------------------------------------------------------------------------

# 18. Leaderboard Collection

For a small/medium college event, the leaderboard can be recalculated
whenever an evaluation changes.

Example:

``` json
{
  "_id": "ObjectId",
  "assessmentId": "ObjectId",
  "studentId": "ObjectId",
  "totalMarks": 42,
  "maxMarks": 50,
  "percentage": 84,
  "rank": 3,
  "lastUpdatedAt": "date"
}
```

For larger systems, use aggregation or a dedicated leaderboard service.

------------------------------------------------------------------------

# 19. Score Calculation

Suppose a student has:

``` text
Question 1 = 8/10
Question 2 = 7/10
Question 3 = 10/10
Question 4 = 6/10
Question 5 = 9/10
```

Total:

``` text
8 + 7 + 10 + 6 + 9 = 40
```

Maximum:

``` text
50
```

Percentage:

``` text
40 / 50 * 100 = 80%
```

Leaderboard:

``` text
Student A  48/50
Student B  45/50
Student C  40/50
```

------------------------------------------------------------------------

# 20. Ranking Logic

Sort by:

``` text
totalMarks DESC
```

If two students have the same score, define a deterministic tie-breaker.

Recommended:

``` text
1. Total marks DESC
2. Number of completed questions DESC
3. Evaluation completion time ASC
```

Alternatively, for fairness, display the same rank for equal scores.

Example:

``` text
Rank  Student   Score
1     A         48
2     B         45
3     C         40
3     D         40
5     E         38
```

Choose and document the tie policy before the event.

------------------------------------------------------------------------

# 21. Live Leaderboard Architecture

Use WebSockets with Socket.IO.

``` text
Admin
  |
  | Gives mark
  v
Node.js API
  |
  v
Save Evaluation
  |
  v
Recalculate Score
  |
  v
Update Leaderboard
  |
  v
Socket.IO
  |
  +-----------------------+
  |           |           |
  v           v           v
Student A   Student B   Student C
Browser     Browser     Browser
```

The browser should not repeatedly refresh the leaderboard.

------------------------------------------------------------------------

# 22. Socket.IO Events

Recommended events:

``` text
leaderboard:update
submission:updated
evaluation:updated
assessment:started
assessment:ended
```

Example:

``` text
Admin evaluates student
        |
        v
evaluation:updated
        |
        v
leaderboard:update
        |
        v
All connected clients receive updated leaderboard
```

------------------------------------------------------------------------

# 23. Leaderboard Update Strategy

When admin submits marks:

``` text
POST /api/admin/evaluations
        |
        v
Validate admin
        |
        v
Validate submission
        |
        v
Save evaluation
        |
        v
Calculate student's total
        |
        v
Recalculate affected ranks
        |
        v
Emit leaderboard:update
```

Only the affected leaderboard data needs to be sent if optimizing for
performance.

------------------------------------------------------------------------

# 24. Frontend Page Structure

Recommended Next.js App Router structure:

``` text
app/
│
├── page.tsx
│
├── login/
│   └── page.tsx
│
├── student/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── questions/
│   │   └── [questionId]/
│   │       └── page.tsx
│   ├── submissions/
│   │   └── page.tsx
│   └── leaderboard/
│       └── page.tsx
│
├── admin/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── students/
│   │   └── page.tsx
│   ├── questions/
│   │   └── page.tsx
│   ├── submissions/
│   │   └── page.tsx
│   ├── evaluations/
│   │   └── page.tsx
│   └── leaderboard/
│       └── page.tsx
│
└── unauthorized/
    └── page.tsx
```

------------------------------------------------------------------------

# 25. Student Dashboard

Dashboard should show:

``` text
--------------------------------------
Welcome, Kavin
--------------------------------------

Assessment:
First Year Coding Challenge

Status:
LIVE

Questions:
5

Completed:
3 / 5

Marks:
18 / 50

Current Rank:
12

[Continue Assessment]

[Leaderboard]
--------------------------------------
```

------------------------------------------------------------------------

# 26. Question Page

Example:

``` text
--------------------------------------
Question 3 of 5

Find the Largest Number

Difficulty: Easy
Marks: 10

Write a program to find the largest
element in an array.

[Question Description]

--------------------------------------

Your Code

[Student uses external IDE/editor]

--------------------------------------

Upload Screenshot

[ Choose Image ]

[ Upload Submission ]

--------------------------------------

Status:
Uploaded ✓
--------------------------------------

[Next Question]
```

------------------------------------------------------------------------

# 27. Screenshot Upload Flow

``` text
Student
   |
   v
Select Screenshot
   |
   v
Frontend validates:
- file type
- file size
- dimensions
   |
   v
POST multipart/form-data
   |
   v
Node.js
   |
   +---- Validate JWT
   |
   +---- Validate student assignment
   |
   +---- Validate question
   |
   +---- Validate file
   |
   v
Image Storage
   |
   v
Save metadata in MongoDB
   |
   v
Return submission ID
```

------------------------------------------------------------------------

# 28. Screenshot Validation

Recommended:

``` text
Allowed:
PNG
JPG
JPEG
WEBP
```

Maximum:

``` text
5 MB
```

Server-side validation is mandatory.

Do not trust only the frontend extension.

Check:

``` text
MIME type
File signature
File size
Image dimensions
```

Optional:

``` text
Resize image
Strip metadata
Compress image
Generate thumbnail
```

------------------------------------------------------------------------

# 29. Admin Evaluation UI

Example:

``` text
---------------------------------------------
Submission Review

Student:
23CSE001 - Student Name

Question:
Find Maximum Element

Maximum Marks:
10

Screenshot:

[ Uploaded Screenshot ]

---------------------------------------------

Marks Obtained:
[ 8 ]

Feedback:
[ Good logic, handle empty input ]

[ Save Evaluation ]
---------------------------------------------
```

After save:

``` text
Score Updated ✓
Leaderboard Updated ✓
```

------------------------------------------------------------------------

# 30. Admin Dashboard

Recommended cards:

``` text
Total Students
150

Submitted
132

Evaluated
95

Pending Evaluation
37

Average Score
68.4%

Highest Score
48/50
```

Also show:

``` text
Recent Submissions
Pending Evaluations
Leaderboard
Question Statistics
```

------------------------------------------------------------------------


# 30A. Admin Runtime Evaluation Screen

The admin should have a dedicated evaluation workspace.

```text
┌──────────────────────────────────────────────────────────────┐
│                    LIVE EVALUATION                          │
├──────────────────────────────────────────────────────────────┤
│ Search Student: [ 23CSE001 / Student Name ]                 │
│                                                              │
│ Student: Student A                 Total: 24/50   Rank: 5   │
├───────────┬──────────────┬───────────────┬─────────────────┤
│ Question  │ Status       │ Marks         │ Action          │
├───────────┼──────────────┼───────────────┼─────────────────┤
│ Q1        │ Evaluated ✓  │ 8/10          │ View            │
│ Q2        │ Evaluated ✓  │ 7/10          │ View            │
│ Q3        │ Pending      │ --/10         │ Evaluate        │
│ Q4        │ Pending      │ --/10         │ Evaluate        │
│ Q5        │ Pending      │ --/10         │ Evaluate        │
└───────────┴──────────────┴───────────────┴─────────────────┘
```

When the admin selects `Evaluate`:

```text
┌─────────────────────────────────────┐
│ Question 3                           │
│ Maximum Marks: 10                   │
│                                     │
│ [ Student Screenshot ]              │
│                                     │
│ Marks: [ 9 ] / 10                   │
│                                     │
│ Feedback:                           │
│ [ Correct logic and output ]        │
│                                     │
│ [ Award Marks ]                     │
└─────────────────────────────────────┘
```

After clicking **Award Marks**:

```text
Saving...
   ↓
Saved ✓
   ↓
Student Score Updated
   ↓
Leaderboard Updated LIVE
```

The admin does not need to manually refresh the page.

# 31. API Architecture

Base URL:

``` text
/api
```

## Authentication

``` text
POST /api/auth/student/login
POST /api/auth/admin/login
POST /api/auth/logout
GET  /api/auth/me
```

------------------------------------------------------------------------

# 32. Student APIs

``` text
GET /api/student/dashboard

GET /api/student/assessment

GET /api/student/questions

GET /api/student/questions/:questionId

POST /api/student/submissions

GET /api/student/submissions

GET /api/student/leaderboard

GET /api/student/profile
```

------------------------------------------------------------------------

# 33. Admin APIs

``` text
GET    /api/admin/dashboard

GET    /api/admin/students
POST   /api/admin/students
PUT    /api/admin/students/:id
DELETE /api/admin/students/:id

GET    /api/admin/questions
POST   /api/admin/questions
PUT    /api/admin/questions/:id
DELETE /api/admin/questions/:id

GET    /api/admin/submissions
GET    /api/admin/submissions/:id

POST   /api/admin/evaluations
PUT    /api/admin/evaluations/:id

GET    /api/admin/leaderboard

POST   /api/admin/assessment/start
POST   /api/admin/assessment/end
```

------------------------------------------------------------------------

# 34. Backend Folder Structure

Recommended:

``` text
backend/
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── socket.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── student.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── question.controller.ts
│   │   ├── submission.controller.ts
│   │   ├── evaluation.controller.ts
│   │   └── leaderboard.controller.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Question.ts
│   │   ├── Assessment.ts
│   │   ├── StudentAssignment.ts
│   │   ├── Submission.ts
│   │   ├── Evaluation.ts
│   │   └── Leaderboard.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── student.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── question.routes.ts
│   │   ├── submission.routes.ts
│   │   └── evaluation.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── question.service.ts
│   │   ├── submission.service.ts
│   │   ├── evaluation.service.ts
│   │   └── leaderboard.service.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── random.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── package.json
└── .env
```

------------------------------------------------------------------------

# 35. Frontend Folder Structure

``` text
frontend/
│
├── app/
│
├── components/
│   ├── auth/
│   ├── student/
│   ├── admin/
│   ├── leaderboard/
│   ├── questions/
│   └── common/
│
├── lib/
│   ├── api.ts
│   ├── socket.ts
│   └── auth.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useLeaderboard.ts
│   └── useAssessment.ts
│
├── types/
│   ├── user.ts
│   ├── question.ts
│   ├── submission.ts
│   └── leaderboard.ts
│
├── providers/
│   └── SocketProvider.tsx
│
└── middleware.ts
```

------------------------------------------------------------------------

# 36. Authentication Architecture

Use JWT-based authentication.

``` text
Login
  |
  v
Validate credentials
  |
  v
Compare password hash
  |
  v
Generate JWT
  |
  v
Set secure HttpOnly cookie
  |
  v
Frontend accesses protected APIs
```

Recommended cookie settings:

``` text
HttpOnly
Secure
SameSite=Lax/Strict
```

Avoid storing sensitive JWTs in localStorage when possible.

------------------------------------------------------------------------

# 37. Role-Based Authorization

Middleware:

``` text
authenticate()
       |
       v
req.user
       |
       v
authorize("admin")
```

Example:

``` text
Student -> /api/student/*
Admin   -> /api/admin/*
```

A student must never be able to call admin evaluation APIs.

------------------------------------------------------------------------

# 38. Security Requirements

Important security controls:

### Authentication

-   Hash passwords.
-   Use JWT/session authentication.
-   Use secure cookies.
-   Implement logout.

### Authorization

-   Check role on every protected endpoint.
-   Never trust role sent from frontend.

### Upload Security

-   Validate MIME type.
-   Validate file signature.
-   Restrict size.
-   Generate safe filenames.
-   Do not execute uploaded files.

### API Security

-   Rate limiting.
-   CORS configuration.
-   Helmet.
-   Input validation.
-   MongoDB query sanitization.
-   Centralized error handling.

### Database Security

-   Use environment variables.
-   Do not expose MongoDB credentials.
-   Restrict database network access.
-   Create least-privilege database users.

------------------------------------------------------------------------

# 39. Important Anti-Cheating Considerations

Since students are submitting screenshots, consider:

## Question randomization

Different students should receive different combinations.

## Time limit

Store:

``` text
startedAt
endsAt
```

Backend should reject late submissions.

## One submission per question

Recommended:

``` text
attemptNumber = 1
```

Or allow a controlled number of attempts.

## Screenshot timestamp

Store:

``` text
submittedAt
```

## Question assignment persistence

Never regenerate questions after refresh.

## Optional screenshot watermark

The backend can generate a watermark containing:

``` text
Student ID
Question ID
Submission ID
Timestamp
```

This can make screenshots easier to audit.

------------------------------------------------------------------------

# 40. Preventing Fake Submissions

A student should not be able to submit a screenshot for another
student's question.

Backend must verify:

``` text
JWT studentId
       ==
submission.studentId
```

And:

``` text
questionId
       belongs to
student assignment
```

Do not rely on hidden frontend fields.

------------------------------------------------------------------------

# 41. Leaderboard Real-Time Design

Recommended approach:

``` text
                 MongoDB
                    |
                    v
            Evaluation Service
                    |
                    v
            Leaderboard Service
                    |
                    v
                Socket.IO
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     Browser     Browser     Browser
```

When an admin changes marks:

``` text
Evaluation saved
      ↓
Score recalculated
      ↓
Rank recalculated
      ↓
Socket event emitted
      ↓
Leaderboard UI updates
```

No page refresh required.

------------------------------------------------------------------------

# 42. Leaderboard Frontend Logic

On page load:

``` text
GET /api/student/leaderboard
```

Then establish Socket.IO connection:

``` text
socket.on("leaderboard:update", (data) => {
    updateLeaderboard(data);
});
```

The UI immediately updates when the server broadcasts a new leaderboard.

------------------------------------------------------------------------

# 43. Example Real-Time Scenario

Initial leaderboard:

``` text
1. Arun     42
2. Priya    40
3. Kavin    38
```

Admin evaluates Kavin's last question:

``` text
Kavin gets +5
```

New score:

``` text
Kavin = 43
```

Server recalculates:

``` text
1. Kavin    43
2. Arun     42
3. Priya    40
```

Socket.IO broadcasts:

``` text
leaderboard:update
```

All connected clients see the updated leaderboard automatically.

------------------------------------------------------------------------

# 44. Data Flow --- Complete

``` text
                    STUDENT
                       |
                       v
                  Next.js UI
                       |
                       v
                  Login API
                       |
                       v
                  JWT Cookie
                       |
                       v
                Student Dashboard
                       |
                       v
               Assessment API
                       |
                       v
             Student Assignment
                       |
                       v
                Random Questions
                       |
                       v
                Solve Question
                       |
                       v
               Screenshot Upload
                       |
                       v
                  Node Backend
                       |
              +--------+--------+
              |                 |
              v                 v
          MongoDB          Image Storage
              |                 |
              +--------+--------+
                       |
                       v
                  Submission
                       |
                       v
                     ADMIN
                       |
                       v
               Review Screenshot
                       |
                       v
                 Give Marks
                       |
                       v
                  Evaluation
                       |
                       v
             Calculate Student Score
                       |
                       v
              Recalculate Rankings
                       |
                       v
                  Socket.IO
                       |
                       v
              Live Leaderboard
```

------------------------------------------------------------------------

# 45. Assessment State Machine

``` text
                ┌───────────┐
                │   DRAFT   │
                └─────┬─────┘
                      │
                      ▼
                ┌───────────┐
                │   READY   │
                └─────┬─────┘
                      │
                 Start Event
                      │
                      ▼
                ┌───────────┐
                │    LIVE   │
                └─────┬─────┘
                      │
                 End Event
                      │
                      ▼
                ┌───────────┐
                │   ENDED   │
                └─────┬─────┘
                      │
                Publish Results
                      │
                      ▼
              ┌─────────────────┐
              │ RESULT_PUBLISHED│
              └─────────────────┘
```

------------------------------------------------------------------------

# 46. Development Phases

Do not build everything at once.

## Phase 1 --- Project Setup

Create:

``` text
frontend/
backend/
```

Set up:

-   Next.js
-   Node.js
-   Express
-   TypeScript
-   MongoDB
-   Git repository

------------------------------------------------------------------------

# 47. Phase 2 --- Authentication

Implement:

``` text
Student Login
Admin Login
JWT
Password hashing
Role middleware
Logout
```

Test:

``` text
Student cannot access admin dashboard.
Admin can access admin dashboard.
```

------------------------------------------------------------------------

# 48. Phase 3 --- Question Management

Admin can:

``` text
Create question
Edit question
Delete/deactivate question
Set difficulty
Set marks
Set category
```

Build question CRUD APIs.

------------------------------------------------------------------------

# 49. Phase 4 --- Assessment Management

Implement:

``` text
Create assessment
Add question pool
Add students
Set duration
Start assessment
End assessment
```

------------------------------------------------------------------------

# 50. Phase 5 --- Random Question Assignment

When a student enters the assessment:

``` text
Check assignment exists
       |
       +-- YES --> return existing assignment
       |
       +-- NO --> generate assignment
                    |
                    v
                 save DB
```

This is important for refresh/re-login consistency.

------------------------------------------------------------------------

# 51. Phase 6 --- Student Question UI

Implement:

``` text
Question list
Question details
Progress indicator
Question status
Submission button
Timer
```

Example:

``` text
Question 1 ✓
Question 2 ✓
Question 3 Current
Question 4 🔒
Question 5 🔒
```

------------------------------------------------------------------------

# 52. Phase 7 --- Screenshot Upload

Implement:

``` text
File picker
Preview
Upload progress
Server validation
Image storage
Submission record
```

Show:

``` text
Uploading...
Uploaded ✓
```

------------------------------------------------------------------------

# 53. Phase 8 --- Admin Evaluation

Build:

``` text
Submission queue
Student filter
Question filter
Screenshot viewer
Marks input
Feedback
Save evaluation
```

Filters:

``` text
All
Pending
Evaluated
```

------------------------------------------------------------------------

# 54. Phase 9 --- Score Engine

Implement:

``` text
calculateStudentScore()
calculatePercentage()
calculateLeaderboard()
calculateRank()
```

These should be backend services.

Do not calculate authoritative marks only on the frontend.

------------------------------------------------------------------------

# 55. Phase 10 --- Real-Time Leaderboard

Add:

``` text
Socket.IO server
Socket.IO client
leaderboard:update event
```

Test with multiple browsers.

Example:

``` text
Chrome → Student A
Edge   → Student B
Firefox → Admin
```

Admin changes marks.

Both student browsers should update immediately.

------------------------------------------------------------------------

# 56. Phase 11 --- Testing

Test these scenarios.

### Authentication

``` text
Valid login
Invalid password
Inactive account
Student accessing admin route
Admin accessing student route
```

### Questions

``` text
Random assignment
No duplicate questions
Refresh
Logout/login
```

### Submission

``` text
Valid image
Invalid image
Large image
Duplicate submission
Wrong question
Wrong student
Late submission
```

### Evaluation

``` text
Valid marks
Marks > maximum
Negative marks
Editing marks
Admin authorization
```

### Leaderboard

``` text
Score update
Rank update
Tie
Multiple admins
Multiple simultaneous updates
```

------------------------------------------------------------------------

# 57. Important Edge Cases

## Student refreshes

Question assignment must remain unchanged.

## Student closes browser

On login, retrieve existing assignment.

## Network fails during upload

Display:

``` text
Upload failed. Please retry.
```

Do not create duplicate submissions accidentally.

## Admin changes marks

Leaderboard should immediately update.

## Two admins evaluate simultaneously

Use transaction/versioning or carefully controlled update logic to
prevent overwriting.

## Assessment ends while student is uploading

Backend decides whether the submission is accepted based on the
authoritative server time.

------------------------------------------------------------------------

# 58. Performance Plan

For a college-level event with hundreds of students:

Use:

``` text
MongoDB indexes
Pagination
Socket.IO
Image compression
Lazy loading
API response caching where appropriate
```

Indexes:

``` text
users.studentId
users.email
questions.active
submissions.studentId
submissions.questionId
submissions.assessmentId
evaluations.studentId
leaderboard.assessmentId
```

Compound indexes can be added based on actual query patterns.

------------------------------------------------------------------------

# 59. Leaderboard Optimization

Do not send unnecessary data.

Instead of:

``` text
student
email
passwordHash
question details
submission details
```

send:

``` json
{
  "rank": 1,
  "studentId": "23CSE001",
  "name": "Student Name",
  "score": 48,
  "maxScore": 50,
  "percentage": 96
}
```

Never expose sensitive fields.

------------------------------------------------------------------------

# 60. API Response Example

## Leaderboard

``` json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "studentId": "23CSE001",
      "name": "Student A",
      "score": 48,
      "maxScore": 50,
      "percentage": 96
    },
    {
      "rank": 2,
      "studentId": "23CSE002",
      "name": "Student B",
      "score": 46,
      "maxScore": 50,
      "percentage": 92
    }
  ]
}
```

------------------------------------------------------------------------

# 61. Recommended UI

## Student

Pages:

``` text
Login
Dashboard
Assessment
Question
Submission
My Results
Leaderboard
Profile
```

## Admin

Pages:

``` text
Login
Dashboard
Students
Questions
Assessments
Submissions
Evaluation
Leaderboard
Reports
Settings
```

------------------------------------------------------------------------

# 62. Leaderboard UI Design

Use a table:

``` text
┌──────┬───────────────┬────────┬────────────┐
│ Rank │ Student       │ Score  │ Percentage │
├──────┼───────────────┼────────┼────────────┤
│ 1    │ Student A     │ 48/50  │ 96%        │
│ 2    │ Student B     │ 46/50  │ 92%        │
│ 3    │ Student C     │ 44/50  │ 88%        │
└──────┴───────────────┴────────┴────────────┘
```

For the logged-in student, highlight their own row.

Add:

``` text
Last updated: Just now
```

------------------------------------------------------------------------

# 63. Admin Evaluation Workflow

Recommended workflow:

``` text
Pending submissions
       |
       v
Select submission
       |
       v
View screenshot
       |
       v
Enter marks
       |
       v
Add feedback
       |
       v
Save
       |
       v
Evaluation stored
       |
       v
Student score updated
       |
       v
Leaderboard updated
       |
       v
Socket event emitted
```

------------------------------------------------------------------------

# 64. Audit Logs

Because marks affect ranking, maintain an audit log.

Example:

``` json
{
  "adminId": "ObjectId",
  "action": "MARK_UPDATED",
  "submissionId": "ObjectId",
  "studentId": "ObjectId",
  "oldMarks": 6,
  "newMarks": 8,
  "timestamp": "date"
}
```

This is extremely useful if there is a dispute.

------------------------------------------------------------------------

# 65. Mark Change Policy

If an admin changes:

``` text
8 → 10
```

store:

``` text
oldMarks = 8
newMarks = 10
changedBy = admin
changedAt = timestamp
```

Then recalculate:

``` text
student total
percentage
rank
```

And broadcast the new leaderboard.

------------------------------------------------------------------------

# 66. Important MongoDB Relationship Model

Avoid putting everything into one huge student document.

Use references:

``` text
User
  |
  +---- StudentAssignment
              |
              +---- Question
              |
              +---- Submission
                         |
                         +---- Evaluation
```

This keeps the system maintainable.

------------------------------------------------------------------------

# 67. Suggested Backend Service Responsibility

## AuthService

Handles:

``` text
login
logout
password verification
JWT
```

## QuestionService

Handles:

``` text
question CRUD
random selection
question assignment
```

## SubmissionService

Handles:

``` text
upload
submission creation
submission validation
```

## EvaluationService

Handles:

``` text
marks
feedback
evaluation history
```

## LeaderboardService

Handles:

``` text
score
percentage
rank
leaderboard
```

------------------------------------------------------------------------

# 68. Critical Rule: Backend Is the Source of Truth

Never trust the frontend for:

``` text
Marks
Rank
Student ID
Question assignment
Assessment status
Submission ownership
Submission deadline
```

Frontend is only the presentation layer.

Backend must verify all of these.

------------------------------------------------------------------------

# 69. Deployment Architecture

A practical deployment:

``` text
                Internet
                   |
          ┌────────┴─────────┐
          |                  |
          v                  v
   Next.js Frontend     Node.js Backend
                              |
                     ┌────────┴────────┐
                     |                 |
                     v                 v
                  MongoDB         Image Storage
```

Possible hosting:

``` text
Frontend → Vercel
Backend  → Render / Railway / VPS
Database → MongoDB Atlas
Images   → Cloudinary / S3 / R2
```

For Socket.IO, make sure the backend host supports persistent WebSocket
connections.

------------------------------------------------------------------------

# 70. Environment Variables

Frontend:

``` env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

Backend:

``` env
PORT=5000
NODE_ENV=production

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=

FRONTEND_URL=

IMAGE_STORAGE_URL=
IMAGE_STORAGE_KEY=
IMAGE_STORAGE_SECRET=
```

Never commit `.env` files.

------------------------------------------------------------------------

# 71. Git Branching Strategy

Recommended:

``` text
main
develop

feature/auth
feature/questions
feature/submissions
feature/evaluation
feature/leaderboard
feature/admin-dashboard
```

Each feature should be tested before merging.

------------------------------------------------------------------------

# 72. MVP Scope

Build this first:

``` text
1. Student login
2. Admin login
3. Question CRUD
4. Random question assignment
5. Student question page
6. Screenshot upload
7. Admin submission review
8. Marks per question
9. Total score calculation
10. Leaderboard
11. Socket.IO live updates
```

Once this works, add advanced features.

------------------------------------------------------------------------

# 73. Phase 2 Features

After MVP:

``` text
Timer
Question difficulty balancing
Feedback
Analytics
CSV student import
CSV question import
Export results
Audit logs
Screenshot watermarking
Notifications
Dark mode
Mobile responsive UI
```

------------------------------------------------------------------------

# 74. Phase 3 Advanced Features

Optional:

``` text
Code editor
Automatic code execution
Test-case evaluation
AI-assisted plagiarism detection
Screenshot OCR
Code similarity detection
Live admin monitoring
Student activity logs
Advanced analytics
```

For your current requirement, automatic code execution is not necessary
because the evaluation is screenshot-based.

------------------------------------------------------------------------

# 75. Recommended Implementation Order

Follow this exact order:

``` text
STEP 1
Create Git repository

STEP 2
Create Next.js frontend

STEP 3
Create Node/Express backend

STEP 4
Connect MongoDB

STEP 5
Create User model

STEP 6
Implement authentication

STEP 7
Implement role-based authorization

STEP 8
Create Question model

STEP 9
Build admin question CRUD

STEP 10
Create Assessment model

STEP 11
Create StudentAssignment model

STEP 12
Implement random question assignment

STEP 13
Build student dashboard

STEP 14
Build question UI

STEP 15
Implement screenshot upload

STEP 16
Create Submission model

STEP 17
Build admin submission review

STEP 18
Create Evaluation model

STEP 19
Implement mark calculation

STEP 20
Implement leaderboard

STEP 21
Add Socket.IO

STEP 22
Implement live leaderboard updates

STEP 23
Add security

STEP 24
Test with multiple users

STEP 25
Deploy
```

------------------------------------------------------------------------

# 76. Final System Architecture

``` text
                         ┌───────────────────────┐
                         │       STUDENTS        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      NEXT.JS          │
                         │                       │
                         │ Login                 │
                         │ Dashboard             │
                         │ Questions             │
                         │ Upload                │
                         │ Results               │
                         │ Leaderboard            │
                         └───────────┬───────────┘
                                     │
                              HTTPS / WebSocket
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    NODE + EXPRESS     │
                         │                       │
                         │ Auth Service          │
                         │ Question Service      │
                         │ Submission Service    │
                         │ Evaluation Service    │
                         │ Leaderboard Service   │
                         │ Socket.IO             │
                         └───────┬───────┬───────┘
                                 │       │
                    ┌────────────┘       └──────────────┐
                    ▼                                   ▼
          ┌──────────────────┐                 ┌─────────────────┐
          │    MONGODB       │                 │ IMAGE STORAGE   │
          │                  │                 │                 │
          │ Users            │                 │ Screenshots     │
          │ Questions        │                 │                 │
          │ Assessments      │                 │                 │
          │ Assignments      │                 │                 │
          │ Submissions      │                 │                 │
          │ Evaluations      │                 │                 │
          │ Leaderboard      │                 │                 │
          │ Audit Logs       │                 │                 │
          └──────────────────┘                 └─────────────────┘
```

------------------------------------------------------------------------


# 76A. Data Consistency for Runtime Marking

Because marks directly affect rankings, score updates must be handled carefully.

Recommended authoritative data flow:

```text
Evaluation
    ↓
Score Calculation
    ↓
Leaderboard Calculation
    ↓
Real-Time Event
```

Do not let the frontend directly modify:

```text
totalMarks
percentage
rank
leaderboard position
```

These are calculated by the backend.

If MongoDB transactions are used, group the evaluation and dependent score/leaderboard writes where appropriate.

If the leaderboard is derived dynamically from evaluations, the evaluation records remain the authoritative source and the leaderboard can be rebuilt from them.

This makes recovery possible if a server restart or WebSocket disconnection occurs.

### WebSocket Reconnection

If a student's internet connection drops:

```text
Socket disconnected
      ↓
Student reconnects
      ↓
Frontend requests current state
      ↓
GET /api/student/dashboard
GET /api/student/leaderboard
      ↓
UI synchronized with MongoDB
```

WebSocket events are for fast updates, but REST APIs remain the recovery/source-of-truth mechanism.

# 77. Final Recommended Architecture Decision

For your project, use:

``` text
Frontend
Next.js + TypeScript + Tailwind

Backend
Node.js + Express + TypeScript

Database
MongoDB + Mongoose

Authentication
JWT + HttpOnly Cookie

Real-Time
Socket.IO

Image Storage
Cloudinary / S3 / R2
(or MongoDB GridFS if MongoDB-only storage is mandatory)

Validation
Zod

Security
Helmet + Rate Limiting + CORS + Input Validation

Deployment
Vercel + Render/Railway + MongoDB Atlas
```

The most important architectural decision is to keep **question
assignment, submissions, marks, score calculation, and ranking on the
backend**, while using **Socket.IO only to push the latest leaderboard
state to connected clients**.

This gives you a clean separation:

``` text
Next.js
   ↓
User Interface

Node.js
   ↓
Business Logic

MongoDB
   ↓
Persistent Data

Image Storage
   ↓
Screenshots

Socket.IO
   ↓
Live Updates
```

This architecture is suitable for a first-year coding competition and
can later be extended to multiple years, departments, contests,
automatic judging, analytics, and larger participant counts.


---

# 78. Final Runtime Marking Architecture Summary

The core runtime workflow is:

```text
                    ADMIN
                      │
                      ▼
             Select Individual Student
                      │
                      ▼
              Select Question
                      │
                      ▼
              View Screenshot
                      │
                      ▼
                Award Marks
                      │
                      ▼
              POST/PUT Evaluation
                      │
                      ▼
              NODE.JS BACKEND
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
      Validate                 MongoDB
          │                        │
          └───────────┬────────────┘
                      ▼
             Recalculate Score
                      │
                      ▼
            Recalculate Rankings
                      │
              ┌───────┴────────┐
              ▼                ▼
       Student Room      Assessment Room
              │                │
              ▼                ▼
     Score + Rank LIVE    Leaderboard LIVE
```

### Final design principles

1. **Admin can award marks to an individual student at runtime.**
2. **Each question has an independent evaluation record.**
3. **Marks can be edited after initial evaluation.**
4. **Every mark change is audited.**
5. **Student total score is recalculated immediately.**
6. **Leaderboard ranking is recalculated immediately.**
7. **The affected student receives a private real-time update.**
8. **The global leaderboard receives a real-time update.**
9. **No page refresh is required.**
10. **MongoDB remains the source of truth.**
11. **Socket.IO is the real-time delivery mechanism, not the source of truth.**
12. **REST APIs are used to recover the latest state after reconnects.**
13. **The backend, not the frontend, determines marks, scores, and ranks.**
