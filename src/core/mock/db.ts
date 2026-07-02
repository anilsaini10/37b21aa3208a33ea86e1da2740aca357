/**
 * In-memory dummy database.
 *
 * Deterministically generates a coherent dataset (students belong to classes,
 * parents own students, fees/attendance/exams reference real students, etc.).
 * All mock API services read from this single source so data stays consistent
 * across the app. No network, no native deps — fully unit-testable.
 */
import type {
  Student,
  Teacher,
  Parent,
  Staff,
  SchoolClass,
  Section,
  Subject,
  FeeInvoice,
  FeePayment,
  Exam,
  Homework,
  Announcement,
  SchoolEvent,
  BusRoute,
  Book,
  BookIssue,
  InventoryItem,
  AttendanceRecord,
  ChatThread,
  AppNotification,
  MarkEntry,
  Gender,
} from '../../shared/types';
import {gradeFor, percentage} from '../utils/grade';

/** Small seeded PRNG (mulberry32) so the dataset is stable across runs. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260701);
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number): number => Math.floor(rnd() * (max - min + 1)) + min;

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Diya', 'Ananya', 'Ishaan', 'Kabir', 'Myra',
  'Reyansh', 'Anika', 'Vihaan', 'Saanvi', 'Arjun', 'Aadhya', 'Krishna', 'Pari',
  'Rohan', 'Kavya', 'Dhruv', 'Riya',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Singh', 'Iyer',
  'Mehta', 'Khan', 'Das', 'Rao', 'Joshi', 'Menon',
];
const SUBJECT_NAMES = ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer'];

const name = (): string => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
const phone = (): string => `9${int(100000000, 999999999)}`;
const gender = (): Gender => pick<Gender>(['male', 'female']);
const isoDate = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// ---- Subjects -------------------------------------------------------------
const subjects: Subject[] = SUBJECT_NAMES.map((s, i) => ({
  id: `sub_${i + 1}`,
  name: s,
  code: s.slice(0, 3).toUpperCase(),
  classIds: [],
}));

// ---- Classes + Sections ---------------------------------------------------
const classes: SchoolClass[] = [];
const sections: Section[] = [];
for (let level = 1; level <= 10; level++) {
  const classId = `cls_${level}`;
  const secList: Section[] = ['A', 'B'].map(secName => {
    const section: Section = {
      id: `sec_${level}_${secName}`,
      name: secName,
      classId,
      capacity: 40,
      studentCount: 0,
    };
    sections.push(section);
    return section;
  });
  classes.push({
    id: classId,
    name: `Class ${level}`,
    numericLevel: level,
    sections: secList,
    totalStudents: 0,
  });
}

// ---- Teachers -------------------------------------------------------------
const teachers: Teacher[] = Array.from({length: 12}, (_, i) => {
  const subs = [pick(SUBJECT_NAMES)];
  const tName = name();
  return {
    id: `tch_${i + 1}`,
    employeeId: `EMP${100 + i}`,
    name: tName,
    gender: gender(),
    email: `${tName.toLowerCase().replace(/\s/g, '.')}@school.edu`,
    phone: phone(),
    subjectIds: [],
    subjects: subs,
    classTeacherOf: i < classes.length ? classes[i].name : undefined,
    joiningDate: isoDate(2018 + (i % 6), int(1, 12), int(1, 28)),
    salary: int(30000, 65000),
    status: 'active',
    performanceScore: int(70, 98),
  };
});

// ---- Parents + Students ---------------------------------------------------
const parents: Parent[] = [];
const students: Student[] = [];
let admissionSeq = 1000;

classes.forEach(cls => {
  cls.sections.forEach(section => {
    const count = int(6, 10);
    for (let r = 1; r <= count; r++) {
      const sName = name();
      const parentId = `par_${parents.length + 1}`;
      const studentId = `stu_${students.length + 1}`;
      const pName = `${pick(['Mr.', 'Mrs.'])} ${sName.split(' ')[1]}`;
      const pPhone = phone();
      parents.push({
        id: parentId,
        name: pName,
        phone: pPhone,
        email: `${pName.toLowerCase().replace(/[^a-z]/g, '')}@mail.com`,
        childIds: [studentId],
        occupation: pick(['Engineer', 'Doctor', 'Business', 'Teacher', 'Farmer']),
        address: `${int(1, 200)}, ${pick(['MG Road', 'Park Street', 'Lake View', 'Green Ave'])}`,
      });
      students.push({
        id: studentId,
        admissionNo: `ADM${admissionSeq++}`,
        name: sName,
        gender: gender(),
        dateOfBirth: isoDate(2026 - (cls.numericLevel + 5), int(1, 12), int(1, 28)),
        classId: cls.id,
        className: cls.name,
        sectionId: section.id,
        sectionName: section.name,
        rollNo: r,
        parentId,
        parentName: pName,
        parentPhone: pPhone,
        bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'O-']),
        address: `${int(1, 200)}, ${pick(['MG Road', 'Park Street', 'Lake View'])}`,
        status: 'active',
        attendancePercentage: int(75, 99),
        documents: [
          {id: `doc_${studentId}_1`, title: 'Birth Certificate', type: 'birth_certificate', uri: 'file://birth.pdf', uploadedAt: isoDate(2024, 6, 12)},
          {id: `doc_${studentId}_2`, title: 'Photo', type: 'photo', uri: 'file://photo.jpg', uploadedAt: isoDate(2024, 6, 12)},
        ],
      });
      section.studentCount++;
    }
  });
  cls.totalStudents = cls.sections.reduce((sum, s) => sum + s.studentCount, 0);
});

// ---- Staff ----------------------------------------------------------------
const staff: Staff[] = Array.from({length: 8}, (_, i) => ({
  id: `stf_${i + 1}`,
  name: name(),
  role: pick(['Accountant', 'Librarian', 'Clerk', 'Security', 'Peon', 'Nurse']),
  phone: phone(),
  department: pick(['Administration', 'Finance', 'Support', 'Health']),
  salary: int(18000, 40000),
  status: 'active',
}));

// ---- Fees -----------------------------------------------------------------
const feeInvoices: FeeInvoice[] = students.slice(0, 60).map((s, i) => {
  const total = int(15000, 45000);
  const paid = i % 3 === 0 ? total : i % 3 === 1 ? Math.round(total * 0.5) : 0;
  const due = total - paid;
  const status = due === 0 ? 'paid' : paid > 0 ? 'partial' : i % 5 === 0 ? 'overdue' : 'pending';
  return {
    id: `inv_${i + 1}`,
    studentId: s.id,
    studentName: s.name,
    className: s.className,
    totalAmount: total,
    paidAmount: paid,
    dueAmount: due,
    status,
    dueDate: isoDate(2026, int(7, 12), int(1, 28)),
    categories: [
      {id: 'fc1', name: 'Tuition', amount: Math.round(total * 0.6), recurring: true},
      {id: 'fc2', name: 'Transport', amount: Math.round(total * 0.25), recurring: true},
      {id: 'fc3', name: 'Exam', amount: Math.round(total * 0.15), recurring: false},
    ],
  };
});

const feePayments: FeePayment[] = feeInvoices
  .filter(inv => inv.paidAmount > 0)
  .map((inv, i) => ({
    id: `pay_${i + 1}`,
    invoiceId: inv.id,
    studentId: inv.studentId,
    amount: inv.paidAmount,
    method: pick(['cash', 'card', 'upi', 'netbanking']),
    paidAt: isoDate(2026, int(1, 6), int(1, 28)),
    receiptNo: `RCP${5000 + i}`,
    transactionId: `TXN${int(100000, 999999)}`,
  }));

// ---- Exams + Marks --------------------------------------------------------
const exams: Exam[] = classes.slice(0, 5).map((cls, i) => ({
  id: `exm_${i + 1}`,
  name: pick(['Unit Test 1', 'Mid Term', 'Final Term', 'Unit Test 2']),
  type: pick(['unit_test', 'midterm', 'final']),
  classId: cls.id,
  className: cls.name,
  startDate: isoDate(2026, 8 + (i % 3), int(1, 10)),
  endDate: isoDate(2026, 8 + (i % 3), int(11, 20)),
  status: pick(['scheduled', 'ongoing', 'completed']),
  schedule: subjects.slice(0, 4).map((sub, j) => ({
    id: `es_${i}_${j}`,
    subjectId: sub.id,
    subjectName: sub.name,
    date: isoDate(2026, 8 + (i % 3), int(1, 20)),
    startTime: '09:00',
    endTime: '11:00',
    maxMarks: 100,
    room: `R${int(101, 110)}`,
  })),
}));

const marks: MarkEntry[] = [];
exams.forEach(exam => {
  const classStudents = students.filter(s => s.classId === exam.classId).slice(0, 8);
  classStudents.forEach(s => {
    exam.schedule.forEach(sc => {
      const obtained = int(35, 98);
      marks.push({
        id: `mk_${marks.length + 1}`,
        examId: exam.id,
        studentId: s.id,
        studentName: s.name,
        subjectId: sc.subjectId,
        subjectName: sc.subjectName,
        marksObtained: obtained,
        maxMarks: sc.maxMarks,
        grade: gradeFor(percentage(obtained, sc.maxMarks)),
      });
    });
  });
});

// ---- Homework -------------------------------------------------------------
const homework: Homework[] = Array.from({length: 14}, (_, i) => {
  const cls = pick(classes);
  const sub = pick(SUBJECT_NAMES);
  const tch = pick(teachers);
  return {
    id: `hw_${i + 1}`,
    title: `${sub} — ${pick(['Chapter Exercise', 'Worksheet', 'Project', 'Reading'])} ${int(1, 12)}`,
    description: 'Complete the assigned exercises and submit before the due date.',
    subjectId: `sub_${SUBJECT_NAMES.indexOf(sub) + 1}`,
    subjectName: sub,
    classId: cls.id,
    className: cls.name,
    sectionId: cls.sections[0].id,
    assignedByTeacherId: tch.id,
    assignedByName: tch.name,
    assignedDate: isoDate(2026, 6, int(1, 25)),
    dueDate: isoDate(2026, 7, int(1, 15)),
    status: pick(['pending', 'submitted', 'graded']),
  };
});

// ---- Announcements + Events ----------------------------------------------
const announcements: Announcement[] = [
  {id: 'an_1', title: 'Annual Sports Day', body: 'Sports day will be held on 20th July. All students must participate.', audience: 'all', category: 'event', publishedAt: isoDate(2026, 6, 25), publishedBy: 'Principal', pinned: true},
  {id: 'an_2', title: 'Fee Payment Reminder', body: 'Q2 fees are due by 15th July. Please pay on time to avoid late charges.', audience: ['parent'], category: 'circular', publishedAt: isoDate(2026, 6, 28), publishedBy: 'Accounts', pinned: false},
  {id: 'an_3', title: 'PTM Scheduled', body: 'Parent-Teacher meeting on 12th July, 10 AM onwards.', audience: ['parent', 'teacher'], category: 'notice', publishedAt: isoDate(2026, 6, 29), publishedBy: 'Admin', pinned: false},
  {id: 'an_4', title: 'Staff Meeting', body: 'All teaching staff to attend the review meeting on Friday.', audience: ['teacher'], category: 'urgent', publishedAt: isoDate(2026, 6, 30), publishedBy: 'Vice Principal', pinned: false},
];

const events: SchoolEvent[] = [
  {id: 'ev_1', title: 'Independence Day', description: 'Flag hoisting & cultural program', date: isoDate(2026, 8, 15), type: 'function'},
  {id: 'ev_2', title: 'Mid Term Exams', description: 'Mid term examinations begin', date: isoDate(2026, 8, 5), endDate: isoDate(2026, 8, 16), type: 'exam'},
  {id: 'ev_3', title: 'Summer Break', description: 'School closed for summer', date: isoDate(2026, 7, 20), endDate: isoDate(2026, 7, 31), type: 'holiday'},
  {id: 'ev_4', title: 'Science Exhibition', description: 'Annual science fair', date: isoDate(2026, 9, 10), type: 'function'},
];

// ---- Transport / Library / Inventory -------------------------------------
const busRoutes: BusRoute[] = Array.from({length: 5}, (_, i) => ({
  id: `route_${i + 1}`,
  routeName: `Route ${i + 1} — ${pick(['North', 'South', 'East', 'West', 'Central'])}`,
  busNumber: `KA-01-${pick(['AB', 'CD', 'EF'])}-${int(1000, 9999)}`,
  driverName: name(),
  driverPhone: phone(),
  stops: Array.from({length: int(4, 7)}, () => pick(['Market', 'Temple', 'Park', 'Station', 'Mall', 'Hospital'])),
  studentCount: int(15, 35),
  capacity: 40,
}));

const books: Book[] = Array.from({length: 16}, (_, i) => {
  const total = int(2, 12);
  return {
    id: `book_${i + 1}`,
    title: pick(['Wings of Fire', 'The Jungle Book', 'Mathematics Vol 1', 'World Atlas', 'Science Encyclopedia', 'Grammar Guide', 'Panchatantra', 'Physics Basics']),
    author: name(),
    isbn: `978-${int(1000000000, 9999999999)}`,
    category: pick(['Fiction', 'Reference', 'Textbook', 'Story', 'Science']),
    totalCopies: total,
    availableCopies: int(0, total),
  };
});

const bookIssues: BookIssue[] = Array.from({length: 8}, (_, i) => {
  const book = pick(books);
  return {
    id: `iss_${i + 1}`,
    bookId: book.id,
    bookTitle: book.title,
    memberName: pick(students).name,
    issuedAt: isoDate(2026, 6, int(1, 20)),
    dueDate: isoDate(2026, 7, int(1, 15)),
    fine: i % 3 === 0 ? int(10, 100) : 0,
    status: pick(['issued', 'returned', 'overdue']),
  };
});

const inventory: InventoryItem[] = Array.from({length: 12}, (_, i) => ({
  id: `inv_item_${i + 1}`,
  name: pick(['Projector', 'Desk', 'Chair', 'Whiteboard', 'Microscope', 'Football', 'Computer', 'Printer']),
  category: pick(['furniture', 'electronics', 'sports', 'lab', 'stationery']),
  quantity: int(1, 50),
  condition: pick(['good', 'needs_repair', 'damaged']),
  location: `Room ${int(101, 220)}`,
  purchaseDate: isoDate(2020 + (i % 5), int(1, 12), int(1, 28)),
  value: int(500, 50000),
}));

// ---- Attendance (today) ---------------------------------------------------
const today = isoDate(2026, 7, 1);
const attendanceRecords: AttendanceRecord[] = students.slice(0, 80).map((s, i) => ({
  id: `att_${i + 1}`,
  date: today,
  studentId: s.id,
  studentName: s.name,
  classId: s.classId,
  sectionId: s.sectionId,
  status: i % 9 === 0 ? 'absent' : i % 13 === 0 ? 'late' : 'present',
}));

// ---- Chat + Notifications -------------------------------------------------
const chatThreads: ChatThread[] = [
  {id: 'ct_1', participantId: teachers[0].id, participantName: teachers[0].name, participantRole: 'teacher', lastMessage: 'Please check the homework submission.', lastMessageAt: isoDate(2026, 6, 30), unreadCount: 2},
  {id: 'ct_2', participantId: parents[0].id, participantName: parents[0].name, participantRole: 'parent', lastMessage: 'Thank you for the update.', lastMessageAt: isoDate(2026, 6, 29), unreadCount: 0},
  {id: 'ct_3', participantId: 'admin_1', participantName: 'School Admin', participantRole: 'admin', lastMessage: 'Staff meeting rescheduled.', lastMessageAt: isoDate(2026, 6, 28), unreadCount: 1},
];

const notifications: AppNotification[] = [
  {id: 'nt_1', title: 'Fee Due Soon', body: 'Q2 fee payment is due on 15 July.', type: 'fee', createdAt: isoDate(2026, 6, 30), read: false},
  {id: 'nt_2', title: 'New Homework', body: 'Mathematics worksheet assigned.', type: 'homework', createdAt: isoDate(2026, 6, 29), read: false},
  {id: 'nt_3', title: 'Exam Schedule', body: 'Mid term timetable published.', type: 'exam', createdAt: isoDate(2026, 6, 28), read: true},
  {id: 'nt_4', title: 'Attendance Alert', body: 'Your ward was marked absent today.', type: 'attendance', createdAt: today, read: false},
];

export const db = {
  subjects,
  classes,
  sections,
  teachers,
  parents,
  students,
  staff,
  feeInvoices,
  feePayments,
  exams,
  marks,
  homework,
  announcements,
  events,
  busRoutes,
  books,
  bookIssues,
  inventory,
  attendanceRecords,
  chatThreads,
  notifications,
  today,
};

export type MockDb = typeof db;
