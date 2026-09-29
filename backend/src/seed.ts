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

    // 1. Create Sample Users
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
    const studentPasswordHash = await bcrypt.hash('StudentPass123!', 10);

    const admin = await User.create({
      name: 'Prof. Vikram Sharma',
      email: 'admin@livecode.edu',
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Department of Computer Science',
      section: 'Staff',
      year: 0
    });

    const student1 = await User.create({
      name: 'Arun Kumar',
      email: 'arun@livecode.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      studentId: '24CSE001',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: 1
    });

    const student2 = await User.create({
      name: 'Priya Sundaram',
      email: 'priya@livecode.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      studentId: '24CSE042',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: 1
    });

    const student3 = await User.create({
      name: 'Kavin Raj',
      email: 'kavin@livecode.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      studentId: '24CSE089',
      department: 'Information Technology',
      section: 'B',
      year: 1
    });

    console.log('[Seed] Created 1 Admin and 3 Student accounts');

    // 2. Create Realistic Question Bank
    const questionsData = [
      {
        title: 'Find Maximum in Array',
        description: 'Write a program that takes an integer array of size N and outputs the maximum element present in the array.',
        language: 'C++ / Python / Java / C',
        difficulty: 'easy',
        category: 'Arrays',
        marks: 10,
        timeLimitMinutes: 15,
        inputFormat: 'Line 1: N (size of array)\nLine 2: N space-separated integers',
        outputFormat: 'Single integer representing the maximum value',
        constraints: '1 <= N <= 10^5\n-10^9 <= Arr[i] <= 10^9',
        sampleInput: '5\n12 45 2 98 33',
        sampleOutput: '98',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Check Palindrome String',
        description: 'Given a string S, determine if it reads the same backward as forward, ignoring casing and alphanumeric spaces.',
        language: 'C++ / Python / Java / C',
        difficulty: 'easy',
        category: 'Strings',
        marks: 10,
        timeLimitMinutes: 15,
        inputFormat: 'A single string S',
        outputFormat: 'Print "YES" if palindrome, else "NO"',
        constraints: '1 <= |S| <= 10^4',
        sampleInput: 'racecar',
        sampleOutput: 'YES',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Prime Factorization',
        description: 'Given a positive integer N, print all of its prime factors in ascending order along with their multiplicities.',
        language: 'C++ / Python / Java / C',
        difficulty: 'medium',
        category: 'Number Theory',
        marks: 15,
        timeLimitMinutes: 20,
        inputFormat: 'An integer N',
        outputFormat: 'Prime factors and powers formatted as p1^k1 * p2^k2...',
        constraints: '2 <= N <= 10^8',
        sampleInput: '60',
        sampleOutput: '2^2 * 3^1 * 5^1',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Matrix Spiral Order Traversal',
        description: 'Given an M x N matrix, return all elements of the matrix in clockwise spiral order.',
        language: 'C++ / Python / Java / C',
        difficulty: 'medium',
        category: '2D Arrays',
        marks: 15,
        timeLimitMinutes: 25,
        inputFormat: 'M and N followed by M lines containing N integers each',
        outputFormat: 'Space-separated integers visited in clockwise spiral order',
        constraints: '1 <= M, N <= 100\n-1000 <= Matrix[i][j] <= 1000',
        sampleInput: '3 3\n1 2 3\n4 5 6\n7 8 9',
        sampleOutput: '1 2 3 6 9 8 7 4 5',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Merge K Sorted Intervals',
        description: 'Given a collection of intervals, merge all overlapping intervals and return the simplified non-overlapping set.',
        language: 'C++ / Python / Java / C',
        difficulty: 'hard',
        category: 'Sorting & Greedy',
        marks: 20,
        timeLimitMinutes: 30,
        inputFormat: 'N followed by N lines of [start, end]',
        outputFormat: 'Merged intervals sorted by start time',
        constraints: '1 <= N <= 10^5\n0 <= start <= end <= 10^9',
        sampleInput: '4\n1 3\n2 6\n8 10\n15 18',
        sampleOutput: '[1,6] [8,10] [15,18]',
        active: true,
        createdBy: admin._id
      },
      {
        title: 'Count Vowels and Consonants',
        description: 'Read an English sentence and output the count of vowels, consonants, and digits separately.',
        language: 'C++ / Python / Java / C',
        difficulty: 'easy',
        category: 'Strings',
        marks: 10,
        timeLimitMinutes: 15,
        inputFormat: 'A single line of text',
        outputFormat: 'Vowels: X, Consonants: Y, Digits: Z',
        constraints: '1 <= length <= 1000',
        sampleInput: 'Antigravity Code 2026',
        sampleOutput: 'Vowels: 6, Consonants: 9, Digits: 4',
        active: true,
        createdBy: admin._id
      }
    ];

    const createdQuestions = await Question.insertMany(questionsData);
    console.log(`[Seed] Created ${createdQuestions.length} programming questions`);

    // 3. Create Active Assessment
    const now = new Date();
    const assessment = await Assessment.create({
      title: 'First Year Algorithmic Sprint 2026',
      description: 'Departmental Coding Evaluation for First Year Engineering Students. Randomly assigned algorithmic problems with runtime screenshot evaluation.',
      totalQuestions: 5,
      durationMinutes: 60,
      status: 'LIVE',
      startsAt: now,
      endsAt: new Date(now.getTime() + 60 * 60 * 1000),
      questionPool: createdQuestions.map((q) => q._id),
      createdBy: admin._id
    });

    console.log(`[Seed] Created Assessment: "${assessment.title}" (Status: LIVE)`);

    // 4. Ensure demo screenshot files exist on disk
    const uploadsDir = path.join(__dirname, '../../uploads/submissions');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create realistic sample code screenshots as SVG/PNG
    const demoSvgContent = (studentName: string, qTitle: string, statusText: string) => `
<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" rx="12" fill="#1e1e2e"/>
  <rect width="800" height="40" rx="12" fill="#181825"/>
  <circle cx="25" cy="20" r="6" fill="#f38ba8"/>
  <circle cx="45" cy="20" r="6" fill="#f9e2af"/>
  <circle cx="65" cy="20" r="6" fill="#a6e3a1"/>
  <text x="400" y="25" fill="#a6adc8" font-family="monospace" font-size="13" text-anchor="middle">terminal - ${studentName} - solution.cpp</text>
  
  <rect x="20" y="55" width="760" height="280" rx="8" fill="#11111b"/>
  <text x="35" y="85" fill="#89b4fa" font-family="monospace" font-size="14">#include &lt;iostream&gt;</text>
  <text x="35" y="105" fill="#89b4fa" font-family="monospace" font-size="14">#include &lt;vector&gt;</text>
  <text x="35" y="125" fill="#cdd6f4" font-family="monospace" font-size="14">using namespace std;</text>
  <text x="35" y="155" fill="#a6e3a1" font-family="monospace" font-size="14">// Solution for: ${qTitle}</text>
  <text x="35" y="175" fill="#fab387" font-family="monospace" font-size="14">int main() {</text>
  <text x="55" y="195" fill="#cdd6f4" font-family="monospace" font-size="14">    int n; if (!(cin &gt;&gt; n)) return 0;</text>
  <text x="55" y="215" fill="#cdd6f4" font-family="monospace" font-size="14">    vector&lt;int&gt; a(n);</text>
  <text x="55" y="235" fill="#cdd6f4" font-family="monospace" font-size="14">    for (int i=0; i&lt;n; i++) cin &gt;&gt; a[i];</text>
  <text x="55" y="255" fill="#89dceb" font-family="monospace" font-size="14">    // Algorithm executed cleanly</text>
  <text x="55" y="275" fill="#cdd6f4" font-family="monospace" font-size="14">    cout &lt;&lt; "Execution Result: ${statusText}" &lt;&lt; endl;</text>
  <text x="55" y="295" fill="#fab387" font-family="monospace" font-size="14">    return 0;</text>
  <text x="35" y="315" fill="#fab387" font-family="monospace" font-size="14">}</text>

  <rect x="20" y="350" width="760" height="125" rx="8" fill="#181825" stroke="#313244"/>
  <text x="35" y="375" fill="#f9e2af" font-family="monospace" font-size="13">$ g++ -O3 solution.cpp -o solution &amp;&amp; ./solution</text>
  <text x="35" y="400" fill="#a6e3a1" font-family="monospace" font-size="13">[OUTPUT] Verified Output matching all test cases.</text>
  <text x="35" y="425" fill="#94e2d5" font-family="monospace" font-size="13">[TIME] 0.004s | Memory: 1.2MB | Passed: 100%</text>
  <text x="35" y="450" fill="#6c7086" font-family="monospace" font-size="12">Verified by Live Code Assessment System</text>
</svg>
`;

    const sub1File = 'demo-submission-arun-q1.svg';
    const sub2File = 'demo-submission-priya-q1.svg';
    const sub3File = 'demo-submission-kavin-q2.svg';

    fs.writeFileSync(path.join(uploadsDir, sub1File), demoSvgContent('Arun Kumar', createdQuestions[0].title, 'Optimal 98'));
    fs.writeFileSync(path.join(uploadsDir, sub2File), demoSvgContent('Priya Sundaram', createdQuestions[0].title, 'Optimal 98'));
    fs.writeFileSync(path.join(uploadsDir, sub3File), demoSvgContent('Kavin Raj', createdQuestions[1].title, 'YES'));

    // 5. Create Deterministic Assignments for all 3 Students
    // Student 1: Arun (Q0, Q1, Q2, Q3, Q4)
    const assign1 = await StudentAssignment.create({
      assessmentId: assessment._id,
      studentId: student1._id,
      questions: [
        { questionId: createdQuestions[0]._id, order: 1, status: 'evaluated' },
        { questionId: createdQuestions[1]._id, order: 2, status: 'submitted' },
        { questionId: createdQuestions[2]._id, order: 3, status: 'pending' },
        { questionId: createdQuestions[3]._id, order: 4, status: 'pending' },
        { questionId: createdQuestions[4]._id, order: 5, status: 'pending' }
      ]
    });

    // Student 2: Priya (Q1, Q0, Q3, Q2, Q5)
    const assign2 = await StudentAssignment.create({
      assessmentId: assessment._id,
      studentId: student2._id,
      questions: [
        { questionId: createdQuestions[1]._id, order: 1, status: 'evaluated' },
        { questionId: createdQuestions[0]._id, order: 2, status: 'evaluated' },
        { questionId: createdQuestions[3]._id, order: 3, status: 'submitted' },
        { questionId: createdQuestions[2]._id, order: 4, status: 'pending' },
        { questionId: createdQuestions[5]._id, order: 5, status: 'pending' }
      ]
    });

    // Student 3: Kavin (Q0, Q2, Q4, Q1, Q5)
    const assign3 = await StudentAssignment.create({
      assessmentId: assessment._id,
      studentId: student3._id,
      questions: [
        { questionId: createdQuestions[0]._id, order: 1, status: 'submitted' },
        { questionId: createdQuestions[2]._id, order: 2, status: 'pending' },
        { questionId: createdQuestions[4]._id, order: 3, status: 'pending' },
        { questionId: createdQuestions[1]._id, order: 4, status: 'pending' },
        { questionId: createdQuestions[5]._id, order: 5, status: 'pending' }
      ]
    });

    // 6. Create Initial Submissions
    // Arun submitted Q1 (Evaluated) and Q2 (Pending evaluation)
    const subArunQ1 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student1._id,
      questionId: createdQuestions[0]._id,
      screenshotUrl: `/uploads/submissions/${sub1File}`,
      codeSnippet: '// Solution by Arun Kumar\nint maxVal = arr[0];\nfor (int i=1; i<n; i++) if(arr[i]>maxVal) maxVal=arr[i];',
      submittedAt: new Date(now.getTime() - 25 * 60 * 1000),
      status: 'EVALUATED'
    });

    const subArunQ2 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student1._id,
      questionId: createdQuestions[1]._id,
      screenshotUrl: `/uploads/submissions/${sub1File}`,
      codeSnippet: '// Palindrome check\nint l = 0, r = s.length() - 1;\nwhile(l < r) { if(s[l++] != s[r--]) return "NO"; }\nreturn "YES";',
      submittedAt: new Date(now.getTime() - 15 * 60 * 1000),
      status: 'SUBMITTED' // PENDING REVIEW FOR ADMIN!
    });

    // Priya submitted Q1 (Evaluated) and Q0 (Evaluated) and Q3 (Pending)
    const subPriyaQ1 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student2._id,
      questionId: createdQuestions[1]._id,
      screenshotUrl: `/uploads/submissions/${sub2File}`,
      codeSnippet: '# Priya Python Solution\ndef is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]',
      submittedAt: new Date(now.getTime() - 30 * 60 * 1000),
      status: 'EVALUATED'
    });

    const subPriyaQ0 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student2._id,
      questionId: createdQuestions[0]._id,
      screenshotUrl: `/uploads/submissions/${sub2File}`,
      codeSnippet: 'print(max(int(x) for x in input().split()))',
      submittedAt: new Date(now.getTime() - 20 * 60 * 1000),
      status: 'EVALUATED'
    });

    const subPriyaQ3 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student2._id,
      questionId: createdQuestions[3]._id,
      screenshotUrl: `/uploads/submissions/${sub2File}`,
      codeSnippet: '// Matrix spiral traversal\n// Full traversal implemented with 4 boundaries',
      submittedAt: new Date(now.getTime() - 10 * 60 * 1000),
      status: 'SUBMITTED' // PENDING REVIEW FOR ADMIN!
    });

    // Kavin submitted Q0 (Pending evaluation)
    const subKavinQ0 = await Submission.create({
      assessmentId: assessment._id,
      studentId: student3._id,
      questionId: createdQuestions[0]._id,
      screenshotUrl: `/uploads/submissions/${sub3File}`,
      codeSnippet: 'int mx = -1e9;\nfor(auto x: v) mx = max(mx, x);\ncout << mx;',
      submittedAt: new Date(now.getTime() - 5 * 60 * 1000),
      status: 'SUBMITTED' // PENDING REVIEW FOR ADMIN!
    });

    // 7. Seed Initial Evaluations
    // Arun evaluated on Q1: 9/10
    const evalArunQ1 = await Evaluation.create({
      assessmentId: assessment._id,
      submissionId: subArunQ1._id,
      studentId: student1._id,
      questionId: createdQuestions[0]._id,
      marksObtained: 9,
      maximumMarks: 10,
      feedback: 'Excellent linear scan logic. Well indented.',
      evaluatedBy: admin._id,
      evaluatedAt: new Date(now.getTime() - 20 * 60 * 1000)
    });

    // Priya evaluated on Q1: 10/10, and Q0: 9/10
    const evalPriyaQ1 = await Evaluation.create({
      assessmentId: assessment._id,
      submissionId: subPriyaQ1._id,
      studentId: student2._id,
      questionId: createdQuestions[1]._id,
      marksObtained: 10,
      maximumMarks: 10,
      feedback: 'Clean pythonic two-pointer palindrome check. Perfect!',
      evaluatedBy: admin._id,
      evaluatedAt: new Date(now.getTime() - 22 * 60 * 1000)
    });

    const evalPriyaQ0 = await Evaluation.create({
      assessmentId: assessment._id,
      submissionId: subPriyaQ0._id,
      studentId: student2._id,
      questionId: createdQuestions[0]._id,
      marksObtained: 9,
      maximumMarks: 10,
      feedback: 'Concise solution. Passed all edge test cases.',
      evaluatedBy: admin._id,
      evaluatedAt: new Date(now.getTime() - 16 * 60 * 1000)
    });

    // 8. Add Audit Logs
    await AuditLog.create([
      {
        adminId: admin._id,
        action: 'MARK_AWARDED',
        submissionId: subArunQ1._id,
        studentId: student1._id,
        questionId: createdQuestions[0]._id,
        newMarks: 9,
        details: 'Initial evaluation for Arun Kumar on Find Maximum in Array',
        timestamp: new Date(now.getTime() - 20 * 60 * 1000)
      },
      {
        adminId: admin._id,
        action: 'MARK_AWARDED',
        submissionId: subPriyaQ1._id,
        studentId: student2._id,
        questionId: createdQuestions[1]._id,
        newMarks: 10,
        details: 'Initial evaluation for Priya Sundaram on Check Palindrome String',
        timestamp: new Date(now.getTime() - 22 * 60 * 1000)
      },
      {
        adminId: admin._id,
        action: 'MARK_AWARDED',
        submissionId: subPriyaQ0._id,
        studentId: student2._id,
        questionId: createdQuestions[0]._id,
        newMarks: 9,
        details: 'Initial evaluation for Priya Sundaram on Find Maximum in Array',
        timestamp: new Date(now.getTime() - 16 * 60 * 1000)
      }
    ]);

    console.log('[Seed] Database successfully seeded with:');
    console.log(' - 1 Admin (admin@livecode.edu / AdminPassword123!)');
    console.log(' - 3 Students:');
    console.log('   1. Arun Kumar (arun@livecode.edu / StudentPass123! | 24CSE001)');
    console.log('   2. Priya Sundaram (priya@livecode.edu / StudentPass123! | 24CSE042)');
    console.log('   3. Kavin Raj (kavin@livecode.edu / StudentPass123! | 24CSE089)');
    console.log(' - 6 Rich Coding Questions');
    console.log(' - 1 LIVE Assessment');
    console.log(' - 3 Pending Submissions ready for live evaluation testing!');
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
