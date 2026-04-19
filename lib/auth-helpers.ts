import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getAuthUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  return user;
}
