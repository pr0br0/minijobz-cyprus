import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user metrics
    const [
      totalUsers,
      activeUsers,
      totalEmployers,
      totalJobSeekers,
      deletedUsers,
      totalPayments,
      successfulPayments
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { not: null } } }),
      db.employer.count(),
      db.jobSeeker.count(),
      db.user.count({ where: { deletedAt: { not: null } } }),
      db.payment.count(),
      db.payment.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Get recent metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.job.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.application.count({ where: { appliedAt: { gte: thirtyDaysAgo } } }),
    ]);

    // Get platform statistics
    const [activeJobs, totalApplications, hires] = await Promise.all([
      db.job.count({ where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] } }),
      db.application.count(),
      db.application.count({ where: { status: 'HIRED' } }),
    ]);

  const calculatedSuccessRate = totalApplications > 0 ? Math.round((hires / totalApplications) * 100) : 0;

    const metrics = {
      totalUsers,
      activeUsers,
  totalEmployers,
  totalJobSeekers,
  deletedUsers,
      totalPayments,
      successfulPayments,
      recentUsers,
      recentJobs,
      recentApplications,
      activeJobs,
      totalApplications,
      successRate: calculatedSuccessRate,
  dataRetentionDays: 730,
  lastAuditDate: new Date().toISOString(),
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}