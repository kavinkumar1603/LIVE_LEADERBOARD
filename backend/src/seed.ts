import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from './models/User';
import { Question } from './models/Question';
import { Assessment } from './models/Assessment';
import { StudentAssignment } from './models/StudentAssignment';
import { Submission } from './models/Submission';
import { Evaluation } from './models/Evaluation';
import { AuditLog } from './models/AuditLog';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_leaderboard_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seed] Connected to MongoDB. Seeding initial data...');

    // Clear old data to ensure clean state
    await User.deleteMany({});
    await Question.deleteMany({});
    await Assessment.deleteMany({});
    await StudentAssignment.deleteMany({});
    await Submission.deleteMany({});
    await Evaluation.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create Admin & SECE Student Accounts
    // Admin: anandaraj.a@sece.ac.in (Password: anandaraj.a@sece.ac.in)
    const adminEmail = 'anandaraj.a@sece.ac.in';
    const adminPasswordHash = await bcrypt.hash(adminEmail, 10);

    const admin = await User.create({
      name: 'Prof. Anandaraj A',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Department of Computer and Communication Engineering',
      section: 'Faculty',
      year: 0
    });

    // Cleaned student emails from contest list
    const rawStudentEmails = [
      'naveen.m2026cse@sece.ac.in',
      'naveenkumar.s2026cse@sece.ac.in',
      'navin.m2026cse@sece.ac.in',
      'nesanth.k2026cse@sece.ac.in',
      'neya.2026cse@sece.ac.in',
      'nigalya.s2026cse@sece.ac.in',
      'nikisha.s2026cse@sece.ac.in',
      'nishant.jc2026cse@sece.ac.in',
      'nithishkumar.m2026cse@sece.ac.in',
      'nithishpranav.m2026cse@sece.ac.in',
      'nitiksha.sg2026cse@sece.ac.in',
      'nivetha.s2026cse@sece.ac.in',
      'nivetha.v2026cse@sece.ac.in',
      'omkarthakur.2026cse@sece.ac.in',
      'oviya.ks2026cse@sece.ac.in',
      'pavithra.i2026cse@sece.ac.in',
      'ponmathilakshmi.2026cse@sece.ac.in',
      'poojasri.ms2026cse@sece.ac.in',
      'poovika.b2026cse@sece.ac.in',
      'prabhakaran.m2026cse@sece.ac.in',
      'pradeesh.s2026cse@sece.ac.in',
      'pragatheesh.s2026cse@sece.ac.in',
      'pragathimuralirasa.2026cse@sece.ac.in',
      'prakash.b2026cse@sece.ac.in',
      'pranav.kk2026cse@sece.ac.in',
      'pranavkumar.s2026cse@sece.ac.in',
      'pranayaaramasubramanian.2026cse@sece.ac.in',
      'praniha.j2026cse@sece.ac.in',
      'prashunkumarojha.2026cse@sece.ac.in',
      'praveena.m2026cse@sece.ac.in',
      'pravin.ts2026cse@sece.ac.in',
      'preethi.amv2026cse@sece.ac.in',
      'preethika.2026cse@sece.ac.in',
      'primolchristy.m2026cse@sece.ac.in',
      'prithikaa.s2026cse@sece.ac.in',
      'prithivraj.a2026cse@sece.ac.in',
      'priyadharshini.r2026cse@sece.ac.in',
      'priyankakumarishah.2026@sece.ac.in',
      'ragashree.a2026cse@sece.ac.in',
      'rajkrishnasah.2026cse@sece.ac.in',
      'rajuvanthi.r2026cse@sece.ac.in',
      'rakashana.r2026cse@sece.ac.in',
      'rakesh.m2026cse@sece.ac.in',
      'rakshit.vs2026cse@sece.ac.in',
      'raksitha.m2026cse@sece.ac.in',
      'ramakrishnanpalanisamy.2026cse@sece.ac.in',
      'ratchitha.ms2026cse@sece.ac.in',
      'rathimozhi.k2026cse@sece.ac.in',
      'rekashini.m2026cse@sece.ac.in',
      'rethika.ns2026cse@sece.ac.in',
      'rijoedward.t2026cse@sece.ac.in',
      'rishikesh.b2026cse@sece.ac.in',
      'rishikesh.k2026cse@sece.ac.in',
      'rishwanth.vg2026cse@sece.ac.in',
      'risonantoniachrisr2026cse@sece.ac.in',
      'rithika.t2026cse@sece.ac.in',
      'rohitpatel.2026cse@sece.ac.in',
      'rohitshriwastav.2026cse@sece.ac.in',
      'roshan.b2026cse@sece.ac.in',
      'rubesh.r2026cse@sece.ac.in',
      'ruthreshwaran.r2026cse@sece.ac.in',
      'sabarinathan.m2026cse@sece.ac.in',
      'sachita.j2026cse@sece.ac.in',
      'sahaanaselvaraj.2026cse@sece.ac.in',
      'saiakshit.s2026cse@sece.ac.in',
      'samreenaa.u2026cse@sece.ac.in',
      'sanghamitra.s2026cse@sece.ac.in'
    ];

    const deriveStudentName = (email: string) => {
      let userPart = email.split('@')[0];
      userPart = userPart.replace(/\.2026(cse)?/gi, '').replace(/2026(cse)?/gi, '');
      const tokens = userPart.split(/[._]/).filter(Boolean);
      return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
    };

    console.log(`[Seed] Hashing passwords for ${rawStudentEmails.length} SECE students (Password = Email)...`);
    const studentUserDocs = await Promise.all(
      rawStudentEmails.map(async (email, index) => {
        const cleanedEmail = email.toLowerCase().trim();
        const hash = await bcrypt.hash(cleanedEmail, 8);
        const rollNum = String(index + 1).padStart(3, '0');
        return {
          name: deriveStudentName(cleanedEmail),
          email: cleanedEmail,
          passwordHash: hash,
          role: 'student' as const,
          studentId: `26CSE${rollNum}`,
          department: 'Computer Science & Engineering',
          section: 'C',
          year: 2026
        };
      })
    );

    const createdStudents = await User.insertMany(studentUserDocs);
    console.log(`[Seed] Created 1 Admin (${adminEmail}) and ${createdStudents.length} Students successfully!`);

    // 2. Questions from Sri Eshwar College of Engineering - COMPILER CLASH : Battle of Bug
    const questionsData = [
      {
        title: 'Q1. Hidden Infinite Loop',
        description: `Analyze the given C++ code snippet containing a loop:

\`\`\`cpp
int n = 10;
while(n)
{
    if(n % 2 == 0)
        n += 2;
    else
        n -= 3;
    cout << n << " ";
}
\`\`\`

**Tasks:**
1. Explain why the loop may never terminate.
2. Modify the logic so the program terminates cleanly.
3. Print the values generated before termination.`,
        language: 'C++ / C',
        difficulty: 'easy',
        category: 'Debugging & Loops',
        marks: 10,
        timeLimitMinutes: 15,
        inputFormat: 'None (Self-contained loop logic analysis)',
        outputFormat: 'Part 1: Reason for non-termination\nPart 2: Modified loop code\nPart 3: Space-separated generated values before termination',
        constraints: 'Standard C++ execution',
        sampleInput: 'No input required',
        sampleOutput: 'Sequence of values generated before termination',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Q2. What Will Be Printed?',
        description: `Determine the output of the following C++ code snippet:

\`\`\`cpp
int x = 1;
while(x <= 20)
{
    if(x % 2 == 0)
    {
        cout << x << " ";
        x += 3;
    }
    else
    {
        x += 2;
    }
}
\`\`\`

**Tasks:**
1. Determine what will be printed by the loop.
2. Modify the code so that it prints only the even numbers from 1 to 500.`,
        language: 'C++ / C',
        difficulty: 'easy',
        category: 'Control Flow & Loops',
        marks: 10,
        timeLimitMinutes: 15,
        inputFormat: 'None',
        outputFormat: 'Part 1: Exact space-separated numbers printed by the code\nPart 2: Modified code printing even numbers from 1 to 500',
        constraints: '1 <= x <= 500',
        sampleInput: 'No input required',
        sampleOutput: '3 6 11 14 19\n(Followed by even sequence up to 500)',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Q3. Diagonal Matrix Transformation',
        description: `Determine the output of the following nested loop program:

\`\`\`cpp
for(int i = 1; i <= 4; i++)
{
    for(int j = 1; j <= 5; j++)
    {
        if(i == j)
            continue;
        cout << i << j << " ";
    }
    cout << endl;
}
\`\`\`

**Tasks:**
1. Determine the output of the given nested loop.
2. Modify the program so that the diagonal elements (where i == j) are printed as 'X'.`,
        language: 'C++ / C',
        difficulty: 'medium',
        category: 'Nested Loops & Patterns',
        marks: 15,
        timeLimitMinutes: 20,
        inputFormat: 'None (i: 1 to 4, j: 1 to 5)',
        outputFormat: 'Part 1: The original output without diagonal elements\nPart 2: 4 lines of 5 space-separated tokens where diagonal elements display as X',
        constraints: '1 <= i <= 4, 1 <= j <= 5',
        sampleInput: 'No input required',
        sampleOutput: `X 12 13 14 15
21 X 23 24 25
31 32 X 34 35
41 42 43 X 45`,
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Q4. Digit Frequency Without Arrays',
        description: `Given a number, determine how many times each digit from 0 to 9 occurs.

**Constraint**: You MUST solve this **without using arrays**, vectors, lists, or hash tables.

**Example:**
Input:
\`1200332120\`

Output:
\`\`\`
0 : 3
1 : 2
2 : 3
3 : 2
4 : 0
\`\`\``,
        language: 'C++ / Python / Java / C',
        difficulty: 'medium',
        category: 'Math & Logic',
        marks: 15,
        timeLimitMinutes: 20,
        inputFormat: 'A single positive integer N',
        outputFormat: 'Print each digit from 0 to 9 and its occurrence count in the format: "<digit> : <count>"',
        constraints: '1 <= N <= 10^18. Do NOT use arrays, vectors, or collection data structures.',
        sampleInput: '1200332120',
        sampleOutput: `0 : 3
1 : 2
2 : 3
3 : 2
4 : 0
5 : 0
6 : 0
7 : 0
8 : 0
9 : 0`,
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Q5. Happy Number Detection',
        description: `A number is called **Happy** if repeatedly replacing it with the sum of the squares of its digits eventually produces 1.

**Example:**
For N = 19:
19
1² + 9² = 82
8² + 2² = 68
6² + 8² = 100
1² + 0² + 0² = 1
Since 1 is reached, 19 is a Happy Number!

**Tasks:**
1. Write a program to check whether N is happy.
2. Print every intermediate value.
3. Detect if the process enters a cycle.`,
        language: 'C++ / Python / Java / C',
        difficulty: 'medium',
        category: 'Number Theory & Algorithms',
        marks: 15,
        timeLimitMinutes: 25,
        inputFormat: 'A single positive integer N',
        outputFormat: 'Print each intermediate value on a new line, concluding with "Happy Number" or "Cycle Detected / Not a Happy Number".',
        constraints: '1 <= N <= 10^6',
        sampleInput: '19',
        sampleOutput: `82
68
100
1
Happy Number`,
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Q6. Kaprekar Number Challenge',
        description: `A number N is called a **Kaprekar number** if:
1. Square N: calculate N²
2. Split the square into two parts.
3. Add the two parts. The result equals N.

**Example:**
45² = 2025
20 + 25 = 45
Therefore 45 is a Kaprekar number.

**Task:**
Print all Kaprekar numbers between 1 and 1000.`,
        language: 'C++ / Python / Java / C',
        difficulty: 'hard',
        category: 'Math & Algorithms',
        marks: 20,
        timeLimitMinutes: 30,
        inputFormat: 'None (Check range 1 to 1000)',
        outputFormat: 'Print all Kaprekar numbers between 1 and 1000 separated by spaces.',
        constraints: '1 <= N <= 1000',
        sampleInput: 'No input required',
        sampleOutput: '1 9 45 55 99 297 703 999',
        active: true,
        createdBy: admin._id
      }
    ];

    const createdQuestions = await Question.insertMany(questionsData);
    console.log(`[Seed] Created ${createdQuestions.length} programming questions`);

    // 3. Create Active Assessment for Compiler Clash
    const now = new Date();
    const assessment = await Assessment.create({
      title: 'COMPILER CLASH : Battle of Bug',
      description: 'Department of Computer and Communication Engineering, Academic Year 2026-2027 [ODD SEM] - Sri Eshwar College of Engineering. Live code assessment, bug battle, and algorithmic challenges.',
      totalQuestions: 6,
      durationMinutes: 90,
      status: 'LIVE',
      startsAt: now,
      endsAt: new Date(now.getTime() + 90 * 60 * 1000),
      questionPool: createdQuestions.map((q) => q._id),
      createdBy: admin._id
    });

    console.log(`[Seed] Created Assessment: "${assessment.title}" (Status: LIVE)`);

    // 4. Ensure uploads directory exists for real student submissions
    const uploadsDir = path.join(__dirname, '../../uploads/submissions');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 5. Create Assignments for all 67 Students (All 6 Questions - Pure Clean State)
    const assignmentDocs = createdStudents.map((st) => ({
      assessmentId: assessment._id,
      studentId: st._id,
      questions: createdQuestions.map((q, qIdx) => ({
        questionId: q._id,
        order: qIdx + 1,
        status: 'pending' as const
      }))
    }));

    await StudentAssignment.insertMany(assignmentDocs);

    console.log('[Seed] Database successfully seeded with ONLY official contest data:');
    console.log(` - 1 Admin: ${adminEmail} (Password: ${adminEmail})`);
    console.log(` - ${createdStudents.length} Students: All configured with Email as both Username and Password!`);
    console.log(' - 6 Compiler Clash Coding Questions (Q1 to Q6)');
    console.log(' - 1 LIVE Assessment: "COMPILER CLASH : Battle of Bug"');
    console.log(' - Zero mock submissions / Zero mock evaluations - completely clean state!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};

// Allow standalone execution: npm run seed
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[Seed] Finished. Exiting.');
    process.exit(0);
  });
}
