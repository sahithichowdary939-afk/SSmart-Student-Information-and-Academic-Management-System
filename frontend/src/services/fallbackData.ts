export const fallbackData = {
  studentDashboard: {
    user: {
      id: 'u-std-1',
      fullName: 'Aarav Sharma',
      username: 'student1',
      email: 'aarav.sharma@campus.edu',
      role: 'student'
    },
    profile: {
      roll_number: '21CSE042',
      admission_number: 'ADM-2024-042',
      department_id: 'dept-cse',
      class_id: 'cls-cse-3a',
      current_year: 3,
      semester: 5,
      blood_group: 'O+',
      cgpa: 8.85
    },
    attendance: {
      overall: {
        totalSessions: 6,
        attendedSessions: 6,
        absentSessions: 0,
        percentage: 100.0,
        isShortage: false
      },
      breakdown: [
        {
          subject: { id: 'sub-dbms', code: 'CS501', name: 'Database Management Systems' },
          stats: { totalSessions: 3, attendedSessions: 3, absentSessions: 0, percentage: 100.0, isShortage: false }
        },
        {
          subject: { id: 'sub-cn', code: 'CS502', name: 'Computer Networks' },
          stats: { totalSessions: 1, attendedSessions: 1, absentSessions: 0, percentage: 100.0, isShortage: false }
        },
        {
          subject: { id: 'sub-os', code: 'CS503', name: 'Operating Systems & Concurrency' },
          stats: { totalSessions: 1, attendedSessions: 1, absentSessions: 0, percentage: 100.0, isShortage: false }
        },
        {
          subject: { id: 'sub-se', code: 'CS504', name: 'Software Engineering Principles' },
          stats: { totalSessions: 1, attendedSessions: 1, absentSessions: 0, percentage: 100.0, isShortage: false }
        }
      ]
    },
    assignments: [
      {
        id: 'asg-1',
        title: 'Assignment 2: Complex SQL Queries & Indexing Analysis',
        description: 'Implement B-Tree index benchmarks and optimize a 10-table join schema with explain analyze reports.',
        due_date: new Date(Date.now() + 48 * 3600000).toISOString(),
        max_marks: 10,
        status: 'published',
        isSubmitted: true
      },
      {
        id: 'asg-2',
        title: 'Packet Tracer Lab 3: Subnetting & OSPF Routing',
        description: 'Configure multi-area OSPF routing on Cisco Packet Tracer and analyze route redistribution tables.',
        due_date: new Date(Date.now() + 96 * 3600000).toISOString(),
        max_marks: 10,
        status: 'published',
        isSubmitted: false
      }
    ],
    internalMarks: [
      {
        id: 'mark-1',
        subject_id: 'CS501 (DBMS)',
        mid1_marks: 28.5,
        mid2_marks: 27.0,
        assignment_marks: 9.5,
        attendance_marks: 5.0,
        consolidated_marks: 28.2,
        max_marks: 30,
        status: 'verified_by_incharge'
      },
      {
        id: 'mark-2',
        subject_id: 'CS502 (Networks)',
        mid1_marks: 26.0,
        mid2_marks: 25.5,
        assignment_marks: 9.0,
        attendance_marks: 5.0,
        consolidated_marks: 26.5,
        max_marks: 30,
        status: 'published_to_students'
      }
    ],
    timetable: {
      version: 2,
      pdf_url: '/timetables/CSE_3A_Sem5_v2.pdf',
      slots: [
        { id: '1', day_of_week: 'Monday', period_number: 1, subject_id: 'CS501 (DBMS)', room_number: 'LH-301', start_time: '09:00', end_time: '09:55' },
        { id: '2', day_of_week: 'Monday', period_number: 2, subject_id: 'CS502 (Networks)', room_number: 'LH-301', start_time: '09:55', end_time: '10:50' },
        { id: '3', day_of_week: 'Monday', period_number: 3, subject_id: 'CS503 (OS)', room_number: 'LH-301', start_time: '11:05', end_time: '12:00' },
        { id: '4', day_of_week: 'Tuesday', period_number: 1, subject_id: 'CS504 (Software Eng)', room_number: 'LH-301', start_time: '09:00', end_time: '09:55' },
        { id: '5', day_of_week: 'Wednesday', period_number: 1, subject_id: 'CS501 (DBMS)', room_number: 'LH-301', start_time: '09:00', end_time: '09:55' },
        { id: '6', day_of_week: 'Thursday', period_number: 1, subject_id: 'CS502 (Networks)', room_number: 'LH-301', start_time: '09:00', end_time: '09:55' }
      ]
    },
    library: {
      borrowedBooks: [
        {
          id: 'issue-1',
          book: { title: 'Database System Concepts (7th Ed.)', author: 'Silberschatz, Korth', shelf_location: 'CS-A-12' },
          due_date: '2026-11-24',
          fine_amount: 0,
          status: 'issued'
        }
      ],
      finePending: 0
    },
    fees: {
      records: [
        { id: 'fee-1', term: 'Semester 5', academic_year: '2026-2027', total_amount: 75000, paid_amount: 75000, pending_amount: 0, status: 'paid' }
      ],
      totalPending: 0
    },
    certificates: [
      {
        id: 'cert-1',
        certificate_type: 'bonafide',
        purpose: 'Passport Application and Education Loan verification',
        status: 'approved',
        applied_at: new Date(Date.now() - 36 * 3600000).toISOString(),
        pdf_url: '/generated_docs/Certificate_21CSE042_Sample.pdf'
      }
    ],
    noDues: [
      {
        id: 'nd-1',
        reason: 'Internship Semester Clearance & NOC',
        status: 'clearances_completed',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        clearances: [
          { id: '1', department: 'library', status: 'cleared', cleared_by_agent_or_officer: 'agent_library' },
          { id: '2', department: 'accounts', status: 'cleared', cleared_by_agent_or_officer: 'agent_no_dues' },
          { id: '3', department: 'laboratory', status: 'cleared', cleared_by_agent_or_officer: 'agent_no_dues' },
          { id: '4', department: 'hostel', status: 'cleared', cleared_by_agent_or_officer: 'agent_no_dues' }
        ]
      }
    ],
    reminders: [
      {
        id: 'rem-1',
        title: 'Complete DBMS Assignment 2 Indexing Analysis',
        description: 'B-tree index benchmark graphs and query plans.',
        remind_at: new Date(Date.now() + 18 * 3600000).toISOString(),
        status: 'pending'
      }
    ]
  }
};
