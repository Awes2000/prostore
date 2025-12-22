'use server';

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const CART_SESSION_COOKIE = 'cartSessionId';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; 


export async function getCartSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value;
}


export async function getOrCreateCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return sessionId;
}


export async function setCartSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}


export async function clearCartSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_SESSION_COOKIE);
}
