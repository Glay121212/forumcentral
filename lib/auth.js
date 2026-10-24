import { cookies } from 'next/headers';
import {
  getSessionUser,
  createSession,
  deleteSession,
  getOrCreateGuest,
} from './db.js';

const SESSION_COOKIE = 'fc_session';
const GUEST_COOKIE = 'fc_guest';

/**
 * Retrieves the current authenticated user or returns the guest identity.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    const user = await getSessionUser(sessionToken);
    if (user) {
      return {
        isAuthenticated: true,
        isGuest: false,
        user: {
          id: user.id,
          username: user.username,
          wowClass: user.wowClass,
          postCount: user.postCount || 0,
          topicCount: user.topicCount || 0,
          buddyList: user.buddyList || [],
          joinedAt: user.joinedAt,
          lastTopicAt: user.lastTopicAt,
          lastReplyAt: user.lastReplyAt,
        },
      };
    }
  }

  // Not authenticated: check or create guest
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value;
  const { guest } = await getOrCreateGuest(guestToken);

  return {
    isAuthenticated: false,
    isGuest: true,
    user: {
      id: guest.id,
      username: guest.username,
      wowClass: null,
      isGuest: true,
      lastPostAt: guest.lastPostAt,
    },
  };
}

/**
 * Sets session cookie after successful login or registration
 */
export async function setAuthCookies(userId) {
  const { token, expiresAt } = await createSession(userId);
  const cookieStore = cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });

  return token;
}

/**
 * Clears session cookie on logout
 */
export async function clearAuthCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await deleteSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Ensures a guest cookie exists for the visitor
 */
export async function ensureGuestCookie() {
  const cookieStore = cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  if (!existing) {
    const { token } = await getOrCreateGuest(null);
    cookieStore.set(GUEST_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    return token;
  }
  return existing;
}
