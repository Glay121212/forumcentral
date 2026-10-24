'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser, setAuthCookies, clearAuthCookies, ensureGuestCookie } from './auth.js';
import {
  registerUserInDb,
  authenticateUser,
  createForumInDb,
  createTopicInDb,
  createReplyInDb,
  toggleBuddyInDb,
  getCategoryBySlug,
  getForumById,
  getTopicById,
} from './db.js';
import { validateUsername, validatePassword, isValidId } from './security.js';
import { processAndUploadImages } from './storage.js';

export async function registerAction(prevState, formData) {
  const username = formData.get('username')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  const confirmPassword = formData.get('confirmPassword')?.toString() || '';

  const userCheck = validateUsername(username);
  if (!userCheck.valid) {
    return { error: userCheck.error };
  }

  const passCheck = validatePassword(password, username);
  if (!passCheck.valid) {
    return { error: passCheck.error };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please verify your password.' };
  }

  const result = await registerUserInDb(userCheck.username, password);
  if (!result.success) {
    return { error: result.error };
  }

  await setAuthCookies(result.user.id);
  redirect('/');
}

export async function loginAction(prevState, formData) {
  const username = formData.get('username')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  if (!username.trim() || !password) {
    return { error: 'Please enter both your username and password.' };
  }

  const result = await authenticateUser(username.trim(), password);
  if (!result.success) {
    return { error: result.error };
  }

  await setAuthCookies(result.user.id);
  redirect('/');
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect('/');
}

export async function createForumAction(prevState, formData) {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();

  if (!isAuthenticated || isGuest) {
    return { error: 'Only registered members can start a new Forum. Please register or log in.' };
  }

  const categorySlug = formData.get('categorySlug')?.toString() || '';
  const name = formData.get('name')?.toString()?.trim() || '';
  const description = formData.get('description')?.toString()?.trim() || '';

  if (!categorySlug || !isValidId(categorySlug)) {
    return { error: 'Invalid category specified.' };
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { error: 'Category not found.' };
  }

  if (name.length < 3 || name.length > 40) {
    return { error: 'Forum name must be between 3 and 40 characters.' };
  }

  if (description.length > 300) {
    return { error: 'Description must not exceed 300 characters.' };
  }

  const result = await createForumInDb({
    categorySlug,
    name,
    description,
    user,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath(`/category/${categorySlug}`);
  revalidatePath('/');
  redirect(`/forum/${result.forum.id}`);
}

export async function createTopicAction(prevState, formData) {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();
  await ensureGuestCookie();

  const forumId = formData.get('forumId')?.toString() || '';
  const categorySlug = formData.get('categorySlug')?.toString() || '';
  const title = formData.get('title')?.toString()?.trim() || '';
  const body = formData.get('body')?.toString()?.trim() || '';

  if (!isValidId(forumId)) {
    return { error: 'Invalid Forum ID specified.' };
  }

  const forum = await getForumById(forumId);
  if (!forum) {
    return { error: 'Forum not found.' };
  }

  if (title.length < 3 || title.length > 120) {
    return { error: 'Topic title must be between 3 and 120 characters.' };
  }

  if (!body || body.length > 5000) {
    return { error: 'Topic message must be between 1 and 5,000 characters.' };
  }

  // Rate-limiting / Cooldown check
  const now = Date.now();
  if (isGuest) {
    if (user.lastPostAt) {
      const elapsed = Math.floor((now - new Date(user.lastPostAt).getTime()) / 1000);
      if (elapsed < 60) {
        return { error: `Guest posting cooldown: please wait ${60 - elapsed} seconds before posting again.` };
      }
    }
  } else {
    if (user.lastTopicAt) {
      const elapsed = Math.floor((now - new Date(user.lastTopicAt).getTime()) / 1000);
      if (elapsed < 30) {
        return { error: `Topic cooldown: please wait ${30 - elapsed} seconds before starting a new topic.` };
      }
    }
  }

  // Process image files
  const fileEntries = formData.getAll('images');
  const files = fileEntries.filter((f) => f && typeof f === 'object' && f.size > 0);

  const uploadResult = await processAndUploadImages(files, isGuest);
  if (!uploadResult.success) {
    return { error: uploadResult.error };
  }

  const result = await createTopicInDb({
    forumId,
    categorySlug: forum.categorySlug || categorySlug,
    title,
    body,
    images: uploadResult.images,
    author: user,
    isGuest,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath(`/forum/${forumId}`);
  revalidatePath('/');
  redirect(`/topic/${result.topic.id}`);
}

export async function createReplyAction(prevState, formData) {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();
  await ensureGuestCookie();

  const topicId = formData.get('topicId')?.toString() || '';
  const body = formData.get('body')?.toString()?.trim() || '';

  if (!isValidId(topicId)) {
    return { error: 'Invalid Topic ID specified.' };
  }

  const topic = await getTopicById(topicId);
  if (!topic) {
    return { error: 'Topic not found.' };
  }

  if (!body || body.length > 5000) {
    return { error: 'Reply message must be between 1 and 5,000 characters.' };
  }

  // Rate-limiting / Cooldown check
  const now = Date.now();
  if (isGuest) {
    if (user.lastPostAt) {
      const elapsed = Math.floor((now - new Date(user.lastPostAt).getTime()) / 1000);
      if (elapsed < 60) {
        return { error: `Guest posting cooldown: please wait ${60 - elapsed} seconds before replying again.` };
      }
    }
  } else {
    if (user.lastReplyAt) {
      const elapsed = Math.floor((now - new Date(user.lastReplyAt).getTime()) / 1000);
      if (elapsed < 10) {
        return { error: `Reply cooldown: please wait ${10 - elapsed} seconds before submitting another reply.` };
      }
    }
  }

  // Process image files
  const fileEntries = formData.getAll('images');
  const files = fileEntries.filter((f) => f && typeof f === 'object' && f.size > 0);

  const uploadResult = await processAndUploadImages(files, isGuest);
  if (!uploadResult.success) {
    return { error: uploadResult.error };
  }

  const result = await createReplyInDb({
    topicId,
    body,
    images: uploadResult.images,
    author: user,
    isGuest,
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath(`/topic/${topicId}`);
  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath('/');
  return { success: true, key: Date.now() };
}

export async function toggleBuddyAction(targetUsername) {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();

  if (!isAuthenticated || isGuest) {
    return { success: false, error: 'Register to add members to your Buddy List.' };
  }

  if (!targetUsername || targetUsername === user.username) {
    return { success: false, error: 'You cannot add yourself to your Buddy List.' };
  }

  const result = await toggleBuddyInDb(user.id, targetUsername);
  revalidatePath(`/member/${targetUsername}`);
  revalidatePath('/');
  return result;
}
