import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();
    const userId = id;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'delete') {
      await db.user.delete({ where: { id: userId } });
      return NextResponse.json({ message: 'User deleted successfully' });
    }

    if (action === 'soft-delete') {
      const updated = await db.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role, deletedAt: updated.deletedAt } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}