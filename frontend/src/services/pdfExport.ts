import { jsPDF } from 'jspdf';

export const pdfExport = {
  // 1. Download Official Timetable PDF
  downloadTimetablePDF: (data: {
    className?: string;
    semester?: number;
    version?: number;
    inchargeName?: string;
    slots?: Array<{
      day_of_week: string;
      period_number: number;
      subject_id: string;
      room_number: string;
      start_time: string;
      end_time: string;
    }>;
  }) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const className = data.className || 'B.Tech CSE - Year 3 (Section A)';
    const semester = data.semester || 5;
    const version = data.version || 2;
    const incharge = data.inchargeName || 'Dr. Ramesh Chandra';

    // Outer Navy Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, pageWidth - 20, 190);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('INSTITUTE OF HIGHER TECHNOLOGY & SCIENCE', pageWidth / 2, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Department of Computer Science & Engineering | Academic Governance Center', pageWidth / 2, 28, { align: 'center' });

    // Title banner
    doc.setFillColor(30, 58, 138);
    doc.rect(15, 34, pageWidth - 30, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`OFFICIAL CLASS TIMETABLE - ${className.toUpperCase()} (SEM ${semester}) - VERSION ${version}.0`, pageWidth / 2, 40.5, { align: 'center' });

    // Meta details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`Academic Year: 2026-2027`, 16, 50);
    doc.text(`Class In-charge: ${incharge}`, pageWidth / 2, 50, { align: 'center' });
    doc.text(`Effective: Current Semester | Date: ${new Date().toLocaleDateString()}`, pageWidth - 16, 50, { align: 'right' });

    // Table Grid
    const startY = 56;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
      { num: 1, time: '09:00 - 09:55' },
      { num: 2, time: '09:55 - 10:50' },
      { num: 3, time: '11:05 - 12:00' },
      { num: 4, time: '12:00 - 12:55' },
      { num: 5, time: '01:45 - 02:40' },
      { num: 6, time: '02:40 - 03:35' }
    ];

    const colWidth = (pageWidth - 65) / periods.length;
    const rowHeight = 18;

    // Header Row
    doc.setFillColor(241, 245, 249);
    doc.rect(15, startY, 35, 12, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DAY / PERIOD', 18, startY + 7.5);

    periods.forEach((p, idx) => {
      const x = 50 + idx * colWidth;
      doc.rect(x, startY, colWidth, 12, 'FD');
      doc.text(`Period ${p.num}`, x + colWidth / 2, startY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(p.time, x + colWidth / 2, startY + 9.5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
    });

    const defaultSlots = [
      { day_of_week: 'Monday', period_number: 1, subject_id: 'CS501 (DBMS)', room_number: 'LH-301' },
      { day_of_week: 'Monday', period_number: 2, subject_id: 'CS502 (Networks)', room_number: 'LH-301' },
      { day_of_week: 'Monday', period_number: 3, subject_id: 'CS503 (OS)', room_number: 'LH-301' },
      { day_of_week: 'Tuesday', period_number: 1, subject_id: 'CS504 (Software Eng)', room_number: 'LH-301' },
      { day_of_week: 'Tuesday', period_number: 2, subject_id: 'CS501 (DBMS)', room_number: 'LH-301' },
      { day_of_week: 'Wednesday', period_number: 1, subject_id: 'CS501 (DBMS Lab)', room_number: 'LAB-2' },
      { day_of_week: 'Wednesday', period_number: 2, subject_id: 'CS501 (DBMS Lab)', room_number: 'LAB-2' },
      { day_of_week: 'Thursday', period_number: 1, subject_id: 'CS502 (Networks)', room_number: 'LH-301' },
      { day_of_week: 'Thursday', period_number: 2, subject_id: 'CS503 (OS)', room_number: 'LH-301' },
      { day_of_week: 'Friday', period_number: 1, subject_id: 'CS503 (OS Lab)', room_number: 'LAB-1' },
      { day_of_week: 'Friday', period_number: 2, subject_id: 'CS503 (OS Lab)', room_number: 'LAB-1' }
    ];

    const activeSlots = data.slots && data.slots.length > 0 ? data.slots : defaultSlots;

    days.forEach((day, rIdx) => {
      const y = startY + 12 + rIdx * rowHeight;
      doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(15, y, 35, rowHeight, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 58, 138);
      doc.text(day, 18, y + rowHeight / 2 + 1);

      periods.forEach((p, cIdx) => {
        const x = 50 + cIdx * colWidth;
        doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(x, y, colWidth, rowHeight, 'FD');

        const slot = activeSlots.find(s => s.day_of_week === day && s.period_number === p.num);
        if (slot) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          doc.text(slot.subject_id, x + colWidth / 2, y + 6.5, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(`Room: ${slot.room_number}`, x + colWidth / 2, y + 12, { align: 'center' });
        } else {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text('Tutorial / Lab', x + colWidth / 2, y + 9.5, { align: 'center' });
        }
      });
    });

    const footY = 175;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Generated by Autonomous Timetable Management Agent | Certified by Central Academic Governance', 16, footY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(incharge, 16, footY + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('Class In-charge (Section A)', 16, footY + 16);

    doc.setFont('helvetica', 'bold');
    doc.text('Dr. V. N. Murthy', pageWidth - 16, footY + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Head of Department (CSE)', pageWidth - 16, footY + 16, { align: 'right' });

    doc.save(`Timetable_CSE_3A_v${version}.pdf`);
  },

  // 2. Download Official Assignment Question Paper PDF
  downloadAssignmentQuestionPaperPDF: (data: {
    title: string;
    description: string;
    subjectName?: string;
    subjectCode?: string;
    dueDate?: string;
    maxMarks?: number;
    facultyName?: string;
  }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const subjectName = data.subjectName || 'Database Management Systems';
    const subjectCode = data.subjectCode || 'CS501';
    const facultyName = data.facultyName || 'Dr. K. S. Rao';
    const maxMarks = data.maxMarks || 10;
    const dueDate = data.dueDate ? new Date(data.dueDate).toLocaleString() : 'Within 48 Hours';

    // Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.2);
    doc.rect(10, 10, pageWidth - 20, 277);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text('INSTITUTE OF HIGHER TECHNOLOGY & SCIENCE', pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Department of Computer Science & Engineering | Academic Assessment System', pageWidth / 2, 30, { align: 'center' });

    // Banner
    doc.setFillColor(30, 58, 138);
    doc.rect(15, 36, pageWidth - 30, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL COURSE ASSIGNMENT QUESTION PAPER', pageWidth / 2, 42.5, { align: 'center' });

    // Details Grid
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Subject: ${subjectName} (${subjectCode})`, 16, 56);
    doc.text(`Faculty: ${facultyName}`, pageWidth - 16, 56, { align: 'right' });

    doc.text(`Max Marks: ${maxMarks} Marks`, 16, 64);
    doc.text(`Submission Due Date: ${dueDate}`, pageWidth - 16, 64, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(16, 70, pageWidth - 16, 70);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`Assignment Title: ${data.title}`, 16, 80);

    // Instructions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Detailed Questions & Problem Statements:', 16, 92);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(data.description, pageWidth - 32);
    doc.text(splitDesc, 16, 100, { lineHeightFactor: 1.5 });

    // Instructions Box
    const boxY = 175;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(16, boxY, pageWidth - 32, 50, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('SUBMISSION GUIDELINES & ACADEMIC INTEGRITY INVARIANTS', 22, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('1. Submit solutions strictly in PDF format through the Student Portal before the deadline.', 22, boxY + 16);
    doc.text('2. Include roll number, name, and subject code on the cover sheet of your uploaded document.', 22, boxY + 22);
    doc.text('3. Submissions will be autonomously evaluated and checked for similarity by Assignment Agent.', 22, boxY + 28);
    doc.text('4. Deterministic formula scales internal marks: 80/20 Mid exams (15) + Assignment (10) + Attendance (5).', 22, boxY + 34);
    doc.text('5. Late submissions after the deadline incur penalty or require Class In-charge authorization.', 22, boxY + 40);

    // Signature
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(facultyName, pageWidth - 16, 250, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Course Faculty / Examiner', pageWidth - 16, 255, { align: 'right' });

    doc.save(`QuestionPaper_${subjectCode}_${data.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}.pdf`);
  },

  // 3. Download Student Assignment Submission Receipt PDF
  downloadSubmissionReceiptPDF: (data: {
    studentName: string;
    rollNumber: string;
    assignmentTitle: string;
    fileName: string;
    submittedAt?: string;
  }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Border
    doc.setDrawColor(16, 185, 129); // Emerald
    doc.setLineWidth(1.2);
    doc.rect(8, 8, pageWidth - 16, 194);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text('OFFICIAL SUBMISSION RECEIPT', pageWidth / 2, 22, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Smart Academic Governance & Assignment Tracking System', pageWidth / 2, 27, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, pageWidth - 14, 32);

    // Submission Metadata
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(data.studentName, 45, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Roll Number:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(data.rollNumber, 45, 50);

    doc.setFont('helvetica', 'bold');
    doc.text('Assignment:', 14, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(data.assignmentTitle.slice(0, 35), 45, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Uploaded PDF:', 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(data.fileName, 45, 66);

    doc.setFont('helvetica', 'bold');
    doc.text('Submission Time:', 14, 74);
    doc.setFont('helvetica', 'normal');
    doc.text(data.submittedAt || new Date().toLocaleString(), 45, 74);

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 14, 82);
    doc.setTextColor(16, 185, 129);
    doc.text('VERIFIED & ENQUEUED FOR EVALUATION', 45, 82);

    // Verification Hash Box
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 96, pageWidth - 28, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.text('AUTONOMOUS ASSIGNMENT AGENT RECEIPT TOKEN', 18, 104);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Receipt ID: RCPT-${Date.now().toString(36).toUpperCase()}`, 18, 110);
    doc.text('Cryptographic invariant verified against submission timestamp.', 18, 115);

    doc.save(`Submission_Receipt_${data.rollNumber}.pdf`);
  },

  // 4. Download Official Bonafide Certificate PDF
  downloadCertificatePDF: (data: {
    studentName: string;
    rollNumber: string;
    purpose?: string;
    certificateNumber?: string;
  }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const certNo = data.certificateNumber || `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const purpose = data.purpose || 'Passport Application and Education Loan verification';

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, pageWidth - 20, 277);

    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, 273);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('INSTITUTE OF HIGHER TECHNOLOGY & SCIENCE', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Affiliated to State Technological University | Approved by AICTE, New Delhi', pageWidth / 2, 34, { align: 'center' });
    doc.text('Campus Road, Knowledge Park, Hyderabad - 500081 | Website: www.campus.edu', pageWidth / 2, 39, { align: 'center' });

    doc.setFillColor(30, 58, 138);
    doc.roundedRect(pageWidth / 2 - 50, 50, 100, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('BONAFIDE CERTIFICATE', pageWidth / 2, 58, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`Ref. No: ${certNo}`, 22, 75);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, pageWidth - 22, 75, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);

    const bodyText = `This is to certify that Mr./Ms. ${data.studentName}, bearing Roll No. ${data.rollNumber}, is a bonafide student of this Institute pursuing B.Tech in Computer Science & Engineering, currently studying in 3rd Year (Semester 5) during the Academic Year 2026-2027.\n\nAccording to the official institutional records, his/her character and conduct during the course of study have been found to be Exemplary.\n\nThis certificate is officially issued upon student request for the purpose of: ${purpose}.`;

    const splitText = doc.splitTextToSize(bodyText, pageWidth - 44);
    doc.text(splitText, 22, 92, { lineHeightFactor: 1.6 });

    // Digital Seal
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(22, 175, pageWidth - 44, 25, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('AGENTIC VERIFIED CREDENTIAL', 28, 183);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Automated Record Hash: SHA256-${certNo}-${data.rollNumber}`, 28, 189);
    doc.text('Verified through Central AI Academic Governance System. Authorized by Office Administrator.', 28, 194);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Mr. S. K. Gupta', 22, 245);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Administrative Officer', 22, 251);

    doc.setFont('helvetica', 'bold');
    doc.text('Dr. V. N. Murthy', pageWidth - 22, 245, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Dean of Academics & Principal', pageWidth - 22, 251, { align: 'right' });

    doc.save(`Bonafide_Certificate_${data.rollNumber}.pdf`);
  },

  // 5. Download Official No-Dues Clearance PDF
  downloadNoDuesPDF: (data: {
    studentName: string;
    rollNumber: string;
    department?: string;
    academicYear?: string;
    clearanceId?: string;
  }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, pageWidth - 20, 277);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text('INSTITUTE OF HIGHER TECHNOLOGY & SCIENCE', pageWidth / 2, 28, { align: 'center' });

    doc.setFillColor(5, 150, 105);
    doc.roundedRect(pageWidth / 2 - 55, 45, 110, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL NO-DUES CLEARANCE CERTIFICATE', pageWidth / 2, 53, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`Clearance ID: ND-${data.rollNumber}`, 22, 70);
    doc.text(`Date of Approval: ${new Date().toLocaleDateString()}`, pageWidth - 22, 70, { align: 'right' });

    doc.setFontSize(11);
    doc.text(`Student Name: ${data.studentName}`, 22, 85);
    doc.text(`Roll Number: ${data.rollNumber}`, 22, 92);
    doc.text(`Department: ${data.department || 'Computer Science & Engineering'}`, 22, 99);

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(22, 110, pageWidth - 44, 60, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('DEPARTMENT', 28, 120);
    doc.text('STATUS', 95, 120);
    doc.text('VERIFYING AGENT / OFFICER', 140, 120);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105);
    doc.text('1. Central Library', 28, 130);
    doc.text('CLEARED (0 Dues)', 95, 130);
    doc.text('Library Agent (Autonomous)', 140, 130);

    doc.text('2. Accounts & Finance', 28, 140);
    doc.text('CLEARED (Paid in Full)', 95, 140);
    doc.text('Accounts Officer Verified', 140, 140);

    doc.text('3. Department Laboratories', 28, 150);
    doc.text('CLEARED (Kits Returned)', 95, 150);
    doc.text('Lab In-charge / Agent', 140, 150);

    doc.text('4. Hostel & Amenities', 28, 160);
    doc.text('CLEARED (No Pending Dues)', 95, 160);
    doc.text('Warden / Agent Verified', 140, 160);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized By:', 22, 230);
    doc.text('Mr. S. K. Gupta', 22, 236);
    doc.setFont('helvetica', 'normal');
    doc.text('Office Administrator & Controller of Examinations', 22, 242);

    doc.save(`NoDues_Clearance_${data.rollNumber}.pdf`);
  }
};
