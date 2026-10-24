import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getFirebaseAdmin } from './firebase-admin.js';
import { hashToken } from './security.js';

// Dummy hash for constant-time comparison against nonexistent users (timing attack protection)
const DUMMY_HASH = '$2a$12$e8k6m7Wb6Q9j0r61d8G0uOLwY8pW1U0WqKjZ1Y4x6c7v8b9n0m1l2';

export const WOW_CLASSES = [
  { id: 'warrior', name: 'Warrior', color: '#c79c6e' },
  { id: 'mage', name: 'Mage', color: '#3fc7eb' },
  { id: 'rogue', name: 'Rogue', color: '#fff569' },
  { id: 'druid', name: 'Druid', color: '#ff7d0a' },
  { id: 'paladin', name: 'Paladin', color: '#f58cba' },
  { id: 'priest', name: 'Priest', color: '#ffffff' },
  { id: 'shaman', name: 'Shaman', color: '#0070de' },
  { id: 'hunter', name: 'Hunter', color: '#abd473' },
  { id: 'warlock', name: 'Warlock', color: '#9482c9' },
  { id: 'deathknight', name: 'Death Knight', color: '#c41f3b' },
];

export const SEED_CATEGORIES = [
  {
    slug: 'general-internet-culture',
    name: 'General & Internet Culture',
    description: 'Off-topic community banter, memes, internet mysteries, and daily stories.',
    order: 1,
    initialForums: [
      {
        id: 'tavern-talk',
        name: 'Tavern Talk',
        description: 'Pull up a hearthstone! Friendly conversations, life stories, and open discussion.',
        creator: 'system',
      },
      {
        id: 'community-news',
        name: 'Community News & Feedback',
        description: 'Updates, suggestions, and official board announcements.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    description: 'MMORPGs, dungeon expeditions, PC battlestations, and game discussions.',
    order: 2,
    initialForums: [
      {
        id: 'azeroth-mmos',
        name: 'Azeroth & MMORPGs',
        description: 'Raids, mythic keystones, guild recruitment, patch notes, and lore speculation.',
        creator: 'system',
      },
      {
        id: 'pc-consoles',
        name: 'PC & Console Adventures',
        description: 'RPGs, retro gems, esports, and upcoming releases.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'tech-programming',
    name: 'Tech & Programming',
    description: 'Software development, systems, algorithms, hardware, and dev tooling.',
    order: 3,
    initialForums: [
      {
        id: 'code-architecture',
        name: 'Code & Architecture',
        description: 'JavaScript, Rust, Go, Python, cloud architectures, and database design.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'music',
    name: 'Music',
    description: 'Albums, instrument gear, concert tours, and playlist exchanges.',
    order: 4,
    initialForums: [
      {
        id: 'bards-guild',
        name: "The Bard's Guild",
        description: 'From tavern acoustic ballads to orchestral symphonies and metal riffs.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'cars-bikes-hobbies',
    name: 'Cars Bikes & Hobbies',
    description: 'Engines, mechanics, cycling, scale models, and outdoor expeditions.',
    order: 5,
    initialForums: [
      {
        id: 'engines-wheels',
        name: 'Engines & Two Wheels',
        description: 'Cars, motorcycles, track days, restoration builds, and road trips.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'anime-fandom',
    name: 'Anime & Fandom',
    description: 'Manga chapters, seasonal anime premieres, collectibles, and fan art.',
    order: 6,
    initialForums: [
      {
        id: 'anime-manga',
        name: 'Anime & Manga Chambers',
        description: 'Seasonal episode threads, classic franchises, and visual novels.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'sports',
    name: 'Sports',
    description: 'Athletics, combat sports, league tournaments, and fitness training.',
    order: 7,
    initialForums: [
      {
        id: 'the-arena',
        name: 'The Grand Arena',
        description: 'Match highlights, strength training regimens, and sports debate.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'parenting-advice',
    name: 'Parenting & Advice',
    description: 'Career advice, family life, work-life balance, and constructive counsel.',
    order: 8,
    initialForums: [
      {
        id: 'counsel-chamber',
        name: 'The Counsel Chamber',
        description: 'Navigating milestones, parenting triumphs, and life decisions.',
        creator: 'system',
      },
    ],
  },
  {
    slug: 'blogs-writing',
    name: 'Blogs & Writing',
    description: 'Original fiction, world-building, journal logs, and poetry.',
    order: 9,
    initialForums: [
      {
        id: 'chronicles-prose',
        name: 'Chronicles & Prose',
        description: 'Share your short stories, campaign notes, and creative writing.',
        creator: 'system',
      },
    ],
  },
];

// Local JSON fallback storage for development/preview without Firebase service account
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      return null;
    }
    const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local database:', err);
  }
}

function getInitialStore() {
  const categories = {};
  const forums = {};
  const topics = {};
  const replies = {};
  const users = {
    system_admin: {
      id: 'system_admin',
      username: 'HighOverlord',
      usernameLower: 'highoverlord',
      wowClass: 'warrior',
      postCount: 15,
      topicCount: 4,
      buddyList: ['ArchmageAnton'],
      joinedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    system_mage: {
      id: 'system_mage',
      username: 'ArchmageAnton',
      usernameLower: 'archmageanton',
      wowClass: 'mage',
      postCount: 28,
      topicCount: 7,
      buddyList: ['HighOverlord'],
      joinedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    },
  };
  const usernames = {
    highoverlord: 'system_admin',
    archmageanton: 'system_mage',
  };
  const sessions = {};
  const guests = {};

  for (const cat of SEED_CATEGORIES) {
    categories[cat.slug] = {
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      forumIds: (cat.initialForums || []).map((f) => f.id),
      createdAt: new Date().toISOString(),
    };

    if (cat.initialForums) {
      for (const forum of cat.initialForums) {
        forums[forum.id] = {
          id: forum.id,
          categorySlug: cat.slug,
          name: forum.name,
          description: forum.description,
          creator: forum.creator || 'system',
          creatorName: forum.creator === 'system' ? 'Forum Admin' : forum.creator,
          topicCount: 0,
          lastPostAt: new Date().toISOString(),
          lastPostTitle: 'Welcome to ' + forum.name,
          lastPostUser: 'System',
          createdAt: new Date().toISOString(),
        };
      }
    }
  }

  // Pre-seed a welcoming topic in Tavern Talk
  const welcomeTopicId = 'welcome-to-forumcentral';
  topics[welcomeTopicId] = {
    id: welcomeTopicId,
    forumId: 'tavern-talk',
    categorySlug: 'general-internet-culture',
    title: 'Welcome to ForumCentral - The Hearth is Warm!',
    body: `Welcome traveler! ForumCentral is your realm for discussions across gaming, technology, anime, music, hobbies, and beyond.

Feel free to browse freely, post as a Guest, or register your character account to unlock your unique class badge, customizable Buddy List, avatar sidebar, and member profile.

May your drops be legendary and your posts insightful!`,
    authorName: 'HighOverlord',
    authorId: 'system_admin',
    authorClass: 'warrior',
    isGuest: false,
    images: [],
    replyCount: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastPostAt: new Date().toISOString(),
  };

  replies['welcome-reply-1'] = {
    id: 'welcome-reply-1',
    topicId: welcomeTopicId,
    body: `Glad to have everyone here. Don't forget that guest posting is fully supported if you prefer to drop in without creating an account!`,
    authorName: 'ArchmageAnton',
    authorId: 'system_mage',
    authorClass: 'mage',
    isGuest: false,
    images: [],
    createdAt: new Date().toISOString(),
  };

  forums['tavern-talk'].topicCount = 1;
  forums['tavern-talk'].lastPostAt = new Date().toISOString();
  forums['tavern-talk'].lastPostTitle = 'Welcome to ForumCentral - The Hearth is Warm!';
  forums['tavern-talk'].lastPostUser = 'ArchmageAnton';

  return {
    categories,
    forums,
    topics,
    replies,
    users,
    usernames,
    sessions,
    guests,
    seeded: true,
  };
}

let memoryDb = null;

function getStore() {
  if (memoryDb) return memoryDb;
  const fromFile = readLocalDb();
  if (fromFile) {
    memoryDb = fromFile;
    return memoryDb;
  }
  memoryDb = getInitialStore();
  writeLocalDb(memoryDb);
  return memoryDb;
}

function saveStore(store) {
  memoryDb = store;
  writeLocalDb(store);
}

/**
 * Ensure seed categories are initialized in Firestore
 */
export async function ensureCategoriesSeeded() {
  const { isConfigured, db } = getFirebaseAdmin();
  if (!isConfigured || !db) {
    // Handled by local store automatically
    getStore();
    return;
  }

  try {
    const metaRef = db.collection('system').doc('metadata');
    const metaSnap = await metaRef.get();
    if (metaSnap.exists && metaSnap.data().seeded) {
      return;
    }

    const batch = db.batch();
    for (const cat of SEED_CATEGORIES) {
      const catRef = db.collection('categories').doc(cat.slug);
      batch.set(
        catRef,
        {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          order: cat.order,
          forumIds: (cat.initialForums || []).map((f) => f.id),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (cat.initialForums) {
        for (const forum of cat.initialForums) {
          const forumRef = db.collection('forums').doc(forum.id);
          batch.set(
            forumRef,
            {
              id: forum.id,
              categorySlug: cat.slug,
              name: forum.name,
              description: forum.description,
              creator: forum.creator || 'system',
              creatorName: forum.creator === 'system' ? 'Forum Admin' : forum.creator,
              topicCount: 0,
              lastPostAt: new Date().toISOString(),
              lastPostTitle: 'Welcome to ' + forum.name,
              lastPostUser: 'System',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
    }

    batch.set(metaRef, { seeded: true, seededAt: new Date().toISOString() });
    await batch.commit();
  } catch (err) {
    console.error('Error seeding categories in Firestore:', err);
  }
}

// -------------------------------------------------------------
// USER & AUTH METHODS
// -------------------------------------------------------------

export async function findUserByUsername(username) {
  if (!username) return null;
  const { isConfigured, db } = getFirebaseAdmin();
  const lower = username.toLowerCase();

  if (!isConfigured || !db) {
    const store = getStore();
    const userId = store.usernames[lower];
    if (!userId) return null;
    return store.users[userId] || null;
  }

  const usernameDoc = await db.collection('usernames').doc(lower).get();
  if (!usernameDoc.exists) return null;
  const userId = usernameDoc.data().userId;
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;
  return { id: userDoc.id, ...userDoc.data() };
}

export async function findUserById(userId) {
  if (!userId) return null;
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    return store.users[userId] || null;
  }

  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Register a new user with transactional uniqueness on username,
 * bcrypt cost 12 password hash, and assigned WoW class colour.
 */
export async function registerUserInDb(username, password) {
  const lower = username.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const randomClass = WOW_CLASSES[Math.floor(Math.random() * WOW_CLASSES.length)];
  const userId = 'user_' + crypto.randomBytes(12).toString('hex');
  const now = new Date().toISOString();

  const newUser = {
    id: userId,
    username,
    usernameLower: lower,
    passwordHash,
    wowClass: randomClass.id,
    postCount: 0,
    topicCount: 0,
    buddyList: [],
    failedAttempts: 0,
    lockoutUntil: null,
    joinedAt: now,
    lastActiveAt: now,
    lastTopicAt: null,
    lastReplyAt: null,
    forumsCreatedToday: {
      date: now.slice(0, 10),
      count: 0,
    },
  };

  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    if (store.usernames[lower]) {
      return { success: false, error: 'That username is already taken. Please choose another.' };
    }
    store.usernames[lower] = userId;
    store.users[userId] = newUser;
    saveStore(store);
    return { success: true, user: newUser };
  }

  try {
    await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection('usernames').doc(lower);
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists) {
        throw new Error('USERNAME_TAKEN');
      }

      const userRef = db.collection('users').doc(userId);
      transaction.set(usernameRef, { userId, createdAt: now });
      transaction.set(userRef, newUser);
    });

    return { success: true, user: newUser };
  } catch (err) {
    if (err.message === 'USERNAME_TAKEN') {
      return { success: false, error: 'That username is already taken. Please choose another.' };
    }
    console.error('Registration transaction failed:', err);
    return { success: false, error: 'Registration failed due to a server error. Please try again.' };
  }
}

/**
 * Verify user credentials with lockouts and timing attack defense
 */
export async function authenticateUser(username, password) {
  const lower = username.toLowerCase();
  const user = await findUserByUsername(lower);

  // Timing attack defense: always execute bcrypt compare even if user not found
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return { success: false, error: 'Invalid username or password.' };
  }

  // Check 15-minute lockout
  const now = Date.now();
  if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > now) {
    const minutesLeft = Math.ceil((new Date(user.lockoutUntil).getTime() - now) / 60000);
    return {
      success: false,
      error: `Account is temporarily locked due to 5 failed login attempts. Please try again in ${minutesLeft} minute(s).`,
    };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

  const { isConfigured, db } = getFirebaseAdmin();

  if (!passwordsMatch) {
    const failedAttempts = (user.failedAttempts || 0) + 1;
    let lockoutUntil = null;
    let errorMsg = 'Invalid username or password.';

    if (failedAttempts >= 5) {
      lockoutUntil = new Date(now + 15 * 60 * 1000).toISOString();
      errorMsg = 'Account locked for 15 minutes due to 5 failed login attempts.';
    }

    if (!isConfigured || !db) {
      const store = getStore();
      if (store.users[user.id]) {
        store.users[user.id].failedAttempts = failedAttempts;
        store.users[user.id].lockoutUntil = lockoutUntil;
        saveStore(store);
      }
    } else {
      await db.collection('users').doc(user.id).update({
        failedAttempts,
        lockoutUntil,
      });
    }

    return { success: false, error: errorMsg };
  }

  // Successful login: reset failed attempts
  if (!isConfigured || !db) {
    const store = getStore();
    if (store.users[user.id]) {
      store.users[user.id].failedAttempts = 0;
      store.users[user.id].lockoutUntil = null;
      store.users[user.id].lastActiveAt = new Date().toISOString();
      saveStore(store);
    }
  } else {
    await db.collection('users').doc(user.id).update({
      failedAttempts: 0,
      lockoutUntil: null,
      lastActiveAt: new Date().toISOString(),
    });
  }

  return { success: true, user };
}

/**
 * Creates a new 7-day session token, saves hashed SHA-256 token in database
 */
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const sessionData = {
    tokenHash: hashed,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    store.sessions[hashed] = sessionData;
    saveStore(store);
    return { token, expiresAt };
  }

  await db.collection('sessions').doc(hashed).set(sessionData);
  return { token, expiresAt };
}

/**
 * Validate a session token
 */
export async function getSessionUser(token) {
  if (!token) return null;
  const hashed = hashToken(token);
  const now = new Date().toISOString();
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const session = store.sessions[hashed];
    if (!session || session.expiresAt < now) return null;
    return store.users[session.userId] || null;
  }

  const sessionDoc = await db.collection('sessions').doc(hashed).get();
  if (!sessionDoc.exists) return null;
  const session = sessionDoc.data();
  if (session.expiresAt < now) return null;

  return await findUserById(session.userId);
}

export async function deleteSession(token) {
  if (!token) return;
  const hashed = hashToken(token);
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    delete store.sessions[hashed];
    saveStore(store);
    return;
  }

  await db.collection('sessions').doc(hashed).delete();
}

/**
 * Guest session handler
 */
export async function getOrCreateGuest(guestToken) {
  const now = new Date().toISOString();
  let token = guestToken;
  let hashed = token ? hashToken(token) : null;
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    if (hashed && store.guests[hashed]) {
      return { token, guest: store.guests[hashed] };
    }
    // Generate new guest
    token = crypto.randomBytes(32).toString('hex');
    hashed = hashToken(token);
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    const guest = {
      id: 'guest_' + hashed.slice(0, 16),
      guestNumber,
      username: `Guest${guestNumber}`,
      isGuest: true,
      lastPostAt: null,
      createdAt: now,
    };
    store.guests[hashed] = guest;
    saveStore(store);
    return { token, guest };
  }

  if (hashed) {
    const doc = await db.collection('guests').doc(hashed).get();
    if (doc.exists) {
      return { token, guest: doc.data() };
    }
  }

  token = crypto.randomBytes(32).toString('hex');
  hashed = hashToken(token);
  const guestNumber = Math.floor(1000 + Math.random() * 9000);
  const guest = {
    id: 'guest_' + hashed.slice(0, 16),
    guestNumber,
    username: `Guest${guestNumber}`,
    isGuest: true,
    lastPostAt: null,
    createdAt: now,
  };
  await db.collection('guests').doc(hashed).set(guest);
  return { token, guest };
}

// -------------------------------------------------------------
// FORUM & BOARD METHODS
// -------------------------------------------------------------

export async function getAllCategories() {
  await ensureCategoriesSeeded();
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const list = Object.values(store.categories).sort((a, b) => a.order - b.order);
    const forums = Object.values(store.forums);
    return list.map((cat) => ({
      ...cat,
      forums: forums.filter((f) => f.categorySlug === cat.slug),
    }));
  }

  const catSnap = await db.collection('categories').orderBy('order').get();
  const categories = catSnap.docs.map((d) => ({ ...d.data() }));

  const forumSnap = await db.collection('forums').get();
  const forums = forumSnap.docs.map((d) => ({ ...d.data() }));

  return categories.map((cat) => ({
    ...cat,
    forums: forums.filter((f) => f.categorySlug === cat.slug),
  }));
}

export async function getCategoryBySlug(slug) {
  await ensureCategoriesSeeded();
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const cat = store.categories[slug];
    if (!cat) return null;
    const forums = Object.values(store.forums).filter((f) => f.categorySlug === slug);
    return { ...cat, forums };
  }

  const catDoc = await db.collection('categories').doc(slug).get();
  if (!catDoc.exists) return null;
  const cat = catDoc.data();

  const forumSnap = await db.collection('forums').where('categorySlug', '==', slug).get();
  const forums = forumSnap.docs.map((d) => ({ ...d.data() }));

  return { ...cat, forums };
}

export async function getForumById(forumId) {
  await ensureCategoriesSeeded();
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const forum = store.forums[forumId];
    if (!forum) return null;
    const topics = Object.values(store.topics)
      .filter((t) => t.forumId === forumId)
      .sort((a, b) => new Date(b.lastPostAt || b.createdAt) - new Date(a.lastPostAt || a.createdAt));
    return { ...forum, topics };
  }

  const forumDoc = await db.collection('forums').doc(forumId).get();
  if (!forumDoc.exists) return null;
  const forum = forumDoc.data();

  const topicSnap = await db
    .collection('topics')
    .where('forumId', '==', forumId)
    .orderBy('lastPostAt', 'desc')
    .get();
  const topics = topicSnap.docs.map((d) => ({ ...d.data() }));

  return { ...forum, topics };
}

export async function getTopicById(topicId) {
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const topic = store.topics[topicId];
    if (!topic) return null;
    const replies = Object.values(store.replies)
      .filter((r) => r.topicId === topicId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return { ...topic, replies };
  }

  const doc = await db.collection('topics').doc(topicId).get();
  if (!doc.exists) return null;
  const topic = doc.data();

  const repliesSnap = await db
    .collection('replies')
    .where('topicId', '==', topicId)
    .orderBy('createdAt', 'asc')
    .get();
  const replies = repliesSnap.docs.map((d) => ({ ...d.data() }));

  return { ...topic, replies };
}

export async function getLatestTopics(limitCount = 10) {
  await ensureCategoriesSeeded();
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    return Object.values(store.topics)
      .sort((a, b) => new Date(b.lastPostAt || b.createdAt) - new Date(a.lastPostAt || a.createdAt))
      .slice(0, limitCount);
  }

  const snap = await db
    .collection('topics')
    .orderBy('lastPostAt', 'desc')
    .limit(limitCount)
    .get();

  return snap.docs.map((d) => ({ ...d.data() }));
}

export async function getBuddyTopics(buddyUsernames = [], limitCount = 10) {
  if (!buddyUsernames || buddyUsernames.length === 0) return [];
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const lowerSet = new Set(buddyUsernames.map((u) => u.toLowerCase()));
    return Object.values(store.topics)
      .filter((t) => lowerSet.has((t.authorName || '').toLowerCase()))
      .sort((a, b) => new Date(b.lastPostAt || b.createdAt) - new Date(a.lastPostAt || a.createdAt))
      .slice(0, limitCount);
  }

  // Firestore in query supports up to 30 items
  const chunks = buddyUsernames.slice(0, 30);
  const snap = await db
    .collection('topics')
    .where('authorName', 'in', chunks)
    .orderBy('lastPostAt', 'desc')
    .limit(limitCount)
    .get();

  return snap.docs.map((d) => ({ ...d.data() }));
}

export async function getAllMembers() {
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    return Object.values(store.users)
      .map((u) => ({
        username: u.username,
        wowClass: u.wowClass,
        postCount: u.postCount || 0,
        topicCount: u.topicCount || 0,
        joinedAt: u.joinedAt,
      }))
      .sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
  }

  const snap = await db.collection('users').get();
  return snap.docs
    .map((d) => {
      const u = d.data();
      return {
        username: u.username,
        wowClass: u.wowClass,
        postCount: u.postCount || 0,
        topicCount: u.topicCount || 0,
        joinedAt: u.joinedAt,
      };
    })
    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
}

// -------------------------------------------------------------
// MUTATION METHODS (FORUMS, TOPICS, REPLIES, BUDDY LIST)
// -------------------------------------------------------------

export async function createForumInDb({ categorySlug, name, description, user }) {
  const today = new Date().toISOString().slice(0, 10);
  const forumId = 'forum_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  const newForum = {
    id: forumId,
    categorySlug,
    name,
    description,
    creator: user.id,
    creatorName: user.username,
    creatorClass: user.wowClass,
    topicCount: 0,
    lastPostAt: now,
    lastPostTitle: 'New Forum Created',
    lastPostUser: user.username,
    createdAt: now,
  };

  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    // Daily limit check
    const userObj = store.users[user.id];
    if (userObj) {
      if (userObj.forumsCreatedToday?.date === today) {
        if ((userObj.forumsCreatedToday.count || 0) >= 5) {
          return { success: false, error: 'You have reached the maximum limit of 5 new forums per day.' };
        }
        userObj.forumsCreatedToday.count += 1;
      } else {
        userObj.forumsCreatedToday = { date: today, count: 1 };
      }
    }
    store.forums[forumId] = newForum;
    if (store.categories[categorySlug]) {
      store.categories[categorySlug].forumIds = store.categories[categorySlug].forumIds || [];
      store.categories[categorySlug].forumIds.push(forumId);
    }
    saveStore(store);
    return { success: true, forum: newForum };
  }

  try {
    const userRef = db.collection('users').doc(user.id);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (userData?.forumsCreatedToday?.date === today) {
      if ((userData.forumsCreatedToday.count || 0) >= 5) {
        return { success: false, error: 'You have reached the maximum limit of 5 new forums per day.' };
      }
      await userRef.update({
        'forumsCreatedToday.count': (userData.forumsCreatedToday.count || 0) + 1,
      });
    } else {
      await userRef.update({
        forumsCreatedToday: { date: today, count: 1 },
      });
    }

    await db.collection('forums').doc(forumId).set(newForum);
    return { success: true, forum: newForum };
  } catch (err) {
    console.error('Error creating forum in db:', err);
    return { success: false, error: 'Failed to create forum. Please try again.' };
  }
}

export async function createTopicInDb({
  forumId,
  categorySlug,
  title,
  body,
  images,
  author,
  isGuest,
}) {
  const topicId = 'topic_' + crypto.randomBytes(10).toString('hex');
  const now = new Date().toISOString();

  const newTopic = {
    id: topicId,
    forumId,
    categorySlug,
    title,
    body,
    images: images || [],
    authorId: author.id,
    authorName: author.username,
    authorClass: author.wowClass || null,
    isGuest: !!isGuest,
    replyCount: 0,
    createdAt: now,
    lastPostAt: now,
  };

  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    store.topics[topicId] = newTopic;
    if (store.forums[forumId]) {
      store.forums[forumId].topicCount = (store.forums[forumId].topicCount || 0) + 1;
      store.forums[forumId].lastPostAt = now;
      store.forums[forumId].lastPostTitle = title;
      store.forums[forumId].lastPostUser = author.username;
    }
    if (!isGuest && store.users[author.id]) {
      store.users[author.id].postCount = (store.users[author.id].postCount || 0) + 1;
      store.users[author.id].topicCount = (store.users[author.id].topicCount || 0) + 1;
      store.users[author.id].lastTopicAt = now;
    } else if (isGuest) {
      // update guest cooldown
      const guestKey = Object.keys(store.guests).find((k) => store.guests[k].id === author.id);
      if (guestKey) store.guests[guestKey].lastPostAt = now;
    }
    saveStore(store);
    return { success: true, topic: newTopic };
  }

  const batch = db.batch();
  batch.set(db.collection('topics').doc(topicId), newTopic);

  const forumRef = db.collection('forums').doc(forumId);
  batch.update(forumRef, {
    topicCount: (await forumRef.get()).data()?.topicCount + 1 || 1,
    lastPostAt: now,
    lastPostTitle: title,
    lastPostUser: author.username,
  });

  if (!isGuest) {
    const userRef = db.collection('users').doc(author.id);
    const userSnap = await userRef.get();
    const currentPostCount = userSnap.data()?.postCount || 0;
    const currentTopicCount = userSnap.data()?.topicCount || 0;
    batch.update(userRef, {
      postCount: currentPostCount + 1,
      topicCount: currentTopicCount + 1,
      lastTopicAt: now,
    });
  }

  await batch.commit();
  return { success: true, topic: newTopic };
}

export async function createReplyInDb({ topicId, body, images, author, isGuest }) {
  const replyId = 'reply_' + crypto.randomBytes(10).toString('hex');
  const now = new Date().toISOString();

  const newReply = {
    id: replyId,
    topicId,
    body,
    images: images || [],
    authorId: author.id,
    authorName: author.username,
    authorClass: author.wowClass || null,
    isGuest: !!isGuest,
    createdAt: now,
  };

  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    store.replies[replyId] = newReply;
    const topic = store.topics[topicId];
    if (topic) {
      topic.replyCount = (topic.replyCount || 0) + 1;
      topic.lastPostAt = now;
      if (store.forums[topic.forumId]) {
        store.forums[topic.forumId].lastPostAt = now;
        store.forums[topic.forumId].lastPostTitle = topic.title;
        store.forums[topic.forumId].lastPostUser = author.username;
      }
    }
    if (!isGuest && store.users[author.id]) {
      store.users[author.id].postCount = (store.users[author.id].postCount || 0) + 1;
      store.users[author.id].lastReplyAt = now;
    }
    saveStore(store);
    return { success: true, reply: newReply };
  }

  const batch = db.batch();
  batch.set(db.collection('replies').doc(replyId), newReply);

  const topicRef = db.collection('topics').doc(topicId);
  const topicSnap = await topicRef.get();
  const topicData = topicSnap.data();

  batch.update(topicRef, {
    replyCount: (topicData?.replyCount || 0) + 1,
    lastPostAt: now,
  });

  if (topicData?.forumId) {
    const forumRef = db.collection('forums').doc(topicData.forumId);
    batch.update(forumRef, {
      lastPostAt: now,
      lastPostTitle: topicData.title,
      lastPostUser: author.username,
    });
  }

  if (!isGuest) {
    const userRef = db.collection('users').doc(author.id);
    const userSnap = await userRef.get();
    const currentPostCount = userSnap.data()?.postCount || 0;
    batch.update(userRef, {
      postCount: currentPostCount + 1,
      lastReplyAt: now,
    });
  }

  await batch.commit();
  return { success: true, reply: newReply };
}

export async function toggleBuddyInDb(currentUserId, targetUsername) {
  const { isConfigured, db } = getFirebaseAdmin();

  if (!isConfigured || !db) {
    const store = getStore();
    const user = store.users[currentUserId];
    if (!user) return { success: false, error: 'User not found.' };

    user.buddyList = user.buddyList || [];
    const index = user.buddyList.indexOf(targetUsername);
    let added = false;
    if (index > -1) {
      user.buddyList.splice(index, 1);
      added = false;
    } else {
      user.buddyList.push(targetUsername);
      added = true;
    }
    saveStore(store);
    return { success: true, added, buddyList: user.buddyList };
  }

  const userRef = db.collection('users').doc(currentUserId);
  const snap = await userRef.get();
  if (!snap.exists) return { success: false, error: 'User not found.' };

  const currentList = snap.data().buddyList || [];
  const index = currentList.indexOf(targetUsername);
  let updatedList;
  let added = false;

  if (index > -1) {
    updatedList = currentList.filter((name) => name !== targetUsername);
    added = false;
  } else {
    updatedList = [...currentList, targetUsername];
    added = true;
  }

  await userRef.update({ buddyList: updatedList });
  return { success: true, added, buddyList: updatedList };
}
