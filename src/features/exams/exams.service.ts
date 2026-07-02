/** Exams service — exams, marks, report cards + hooks. */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {gradeFor, percentage} from '../../core/utils/grade';
import {groupBy} from '../../core/utils/misc';
import type {Exam, MarkEntry, ReportCard} from '../../shared/types';

export const examsApi = {
  list: (): Promise<Exam[]> => respond(db.exams),

  getById: (id: string): Promise<Exam | undefined> => respond(db.exams.find(e => e.id === id)),

  marks: (examId: string): Promise<MarkEntry[]> =>
    respond(db.marks.filter(m => m.examId === examId)),

  reportCard: (examId: string, studentId: string): Promise<ReportCard | undefined> => {
    const exam = db.exams.find(e => e.id === examId);
    const student = db.students.find(s => s.id === studentId);
    const studentMarks = db.marks.filter(m => m.examId === examId && m.studentId === studentId);
    if (!exam || !student || studentMarks.length === 0) {
      return respond(undefined);
    }
    const totalMarks = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = studentMarks.reduce((sum, m) => sum + m.maxMarks, 0);
    const pct = percentage(totalMarks, totalMax);
    return respond({
      id: `rc_${examId}_${studentId}`,
      examId,
      examName: exam.name,
      studentId,
      studentName: student.name,
      className: `${student.className} - ${student.sectionName}`,
      subjects: studentMarks.map(m => ({
        subjectName: m.subjectName,
        marks: m.marksObtained,
        maxMarks: m.maxMarks,
        grade: m.grade,
      })),
      totalMarks,
      totalMaxMarks: totalMax,
      percentage: pct,
      overallGrade: gradeFor(pct),
      rank: 1,
    });
  },

  /** All report cards for a student across exams (parent results view). */
  studentReportCards: async (studentId: string): Promise<ReportCard[]> => {
    const byExam = groupBy(
      db.marks.filter(m => m.studentId === studentId),
      m => m.examId,
    );
    const cards: ReportCard[] = [];
    for (const examId of Object.keys(byExam)) {
      const card = await examsApi.reportCard(examId, studentId);
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  },
};

export const useExams = () => useQuery({queryKey: ['exams'], queryFn: examsApi.list});

export const useExamMarks = (examId: string) =>
  useQuery({queryKey: ['exams', 'marks', examId], queryFn: () => examsApi.marks(examId), enabled: !!examId});

export const useReportCard = (examId: string, studentId: string) =>
  useQuery({
    queryKey: ['exams', 'reportCard', examId, studentId],
    queryFn: () => examsApi.reportCard(examId, studentId),
    enabled: !!examId && !!studentId,
  });

export const useStudentReportCards = (studentId: string) =>
  useQuery({
    queryKey: ['exams', 'reportCards', studentId],
    queryFn: () => examsApi.studentReportCards(studentId),
    enabled: !!studentId,
  });
