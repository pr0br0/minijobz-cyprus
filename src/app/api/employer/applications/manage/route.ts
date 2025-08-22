import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_STATUSES = [
  'APPLIED','VIEWED','SHORTLISTED','INTERVIEW','OFFERED','HIRED','REJECTED','WITHDRAWN'
] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employer = await db.employer.findUnique({ where: { userId: session.user.id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = { job: { employerId: employer.id } };
    if (jobId) where.jobId = jobId;
    if (status && VALID_STATUSES.includes(status as any)) where.status = status;

    const [applications, total] = await Promise.all([
      db.application.findMany({
        where,
        include: {
            job: { select: { id: true, title: true, location: true, type: true, status: true, salaryMin: true, salaryMax: true, salaryCurrency: true } },
            jobSeeker: { select: { id: true, firstName: true, lastName: true, location: true, title: true, experience: true, bio: true, cvUrl: true, user: { select: { email: true, name: true } }, skills: { include: { skill: true } } } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.application.count({ where }),
    ]);

    const transformed = applications.map(a => ({
      id: a.id,
      jobId: a.jobId,
      jobTitle: a.job?.title,
      jobLocation: a.job?.location,
      jobType: a.job?.type,
      jobSalary: a.job?.salaryMin && a.job?.salaryMax ? `${a.job.salaryCurrency} ${a.job.salaryMin.toLocaleString()} - ${a.job.salaryMax.toLocaleString()}` : a.job?.salaryMin ? `${a.job.salaryCurrency} ${a.job.salaryMin.toLocaleString()}+` : 'Competitive',
      jobStatus: a.job?.status,
      applicant: a.jobSeeker ? { id: a.jobSeeker.id, name: `${a.jobSeeker.firstName} ${a.jobSeeker.lastName}`, email: a.jobSeeker.user?.email, location: a.jobSeeker.location, title: a.jobSeeker.title, experience: a.jobSeeker.experience, bio: a.jobSeeker.bio, cvUrl: a.jobSeeker.cvUrl, skills: a.jobSeeker.skills.map(s => ({ id: s.skill.id, name: s.skill.name, level: s.level })) } : a.guestEmail ? { id: 'guest', name: a.guestName || 'Guest Applicant', email: a.guestEmail, location: null, title: null, experience: null, bio: null, cvUrl: a.cvUrl, skills: [] } : null,
      status: a.status,
      appliedAt: a.appliedAt,
      viewedAt: a.viewedAt,
      respondedAt: a.respondedAt,
      coverLetter: a.coverLetter,
      notes: a.notes,
    }));

    const statusCountsRaw = await db.application.groupBy({ by: ['status'], _count: { _all: true }, where: { job: { employerId: employer.id } } });
    const statusSummary = statusCountsRaw.reduce((acc: Record<string, number>, row) => { acc[row.status] = row._count._all; return acc; }, {} as Record<string, number>);

    return NextResponse.json({ applications: transformed, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, filters: { status: statusSummary } });
  } catch (e) { console.error('Error fetching applications:', e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'EMPLOYER') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    const employer = await db.employer.findUnique({ where: { userId: session.user.id } });
    if (!employer) { return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 }); }
    const { applicationId, status, notes } = await request.json();
    if (!applicationId) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    if (status && !VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    const application = await db.application.findUnique({ where: { id: applicationId }, include: { job: true } });
    if (!application || application.job.employerId !== employer.id) return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
    const updateData: any = {};
    if (status) { updateData.status = status; if (status === 'VIEWED' && !application.viewedAt) updateData.viewedAt = new Date(); if (['SHORTLISTED','INTERVIEW','OFFERED','HIRED','REJECTED'].includes(status)) updateData.respondedAt = new Date(); }
    if (notes !== undefined) updateData.notes = notes;
    const updated = await db.application.update({ where: { id: applicationId }, data: updateData });
    await db.auditLog.create({ data: { userId: session.user.id, action: 'APPLICATION_STATUS_UPDATE', entityType: 'Application', entityId: applicationId, changes: JSON.stringify({ fromStatus: application.status, toStatus: status, notesChanged: notes !== undefined }), ipAddress: request.headers.get('x-forwarded-for') || 'unknown', userAgent: request.headers.get('user-agent') || 'unknown' } });
    return NextResponse.json({ message: 'Application updated successfully', application: { id: updated.id, status: updated.status, viewedAt: updated.viewedAt, respondedAt: updated.respondedAt, notes: updated.notes } });
  } catch (e) { console.error('Error updating application:', e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'EMPLOYER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const employer = await db.employer.findUnique({ where: { userId: session.user.id } });
    if (!employer) return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    if (!applicationId) return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    const application = await db.application.findUnique({ include: { job: true }, where: { id: applicationId } });
    if (!application || application.job.employerId !== employer.id) return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
    await db.application.delete({ where: { id: applicationId } });
    await db.auditLog.create({ data: { userId: session.user.id, action: 'APPLICATION_DELETED', entityType: 'Application', entityId: applicationId, changes: JSON.stringify({ jobId: application.jobId, guest: !!application.guestEmail }), ipAddress: request.headers.get('x-forwarded-for') || 'unknown', userAgent: request.headers.get('user-agent') || 'unknown' } });
    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (e) { console.error('Error deleting application:', e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}