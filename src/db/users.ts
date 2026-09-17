import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function upsertUser(userData: {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}) {
  try {
    const result = await db.insert(users).values({
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || null,
      photoUrl: userData.photoUrl || null,
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email: userData.email,
        displayName: userData.displayName || null,
        photoUrl: userData.photoUrl || null,
        lastLoginAt: new Date(),
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert user to PostgreSQL:', error);
    return null;
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
) {
  return upsertUser({
    uid,
    email,
    displayName,
    photoUrl
  });
}
