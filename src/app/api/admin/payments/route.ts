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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Validate status against enum values
    const allowedStatuses = ['PENDING','COMPLETED','FAILED','REFUNDED','CANCELLED'];
    const where: any = status && allowedStatuses.includes(status)
      ? { status: status as any }
      : undefined;

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where: where || undefined,
        include: {
          employer: {
            select: {
              companyName: true,
              user: { select: { id: true, email: true, name: true } }
            }
          },
          job: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
  db.payment.count({ where: where || undefined }),
    ]);

    const transformed = payments.map(p => ({
      id: p.id,
      createdAt: p.createdAt,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      type: p.type,
      employer: {
        companyName: p.employer?.companyName || null,
        contact: {
          id: p.employer?.user?.id,
          email: p.employer?.user?.email,
          name: p.employer?.user?.name
        }
      },
      job: p.job ? { id: p.job.id, title: p.job.title } : null
    }));

    return NextResponse.json({
      payments: transformed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}