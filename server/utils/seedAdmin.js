import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@harborhouse.local';
const ADMIN_PASSWORD = 'password';

/**
 * @returns {{ created: boolean; ok: boolean; message: string }}
 */
export async function seedAdmin() {
  const already = await User.findOne({
    $or: [
      { username: ADMIN_USERNAME, role: 'admin' },
      { email: ADMIN_EMAIL, role: 'admin' },
    ],
  });
  if (already) {
    return {
      ok: true,
      created: false,
      message: `Admin already present (username: ${ADMIN_USERNAME}).`,
    };
  }

  const emailTaken = await User.findOne({ email: ADMIN_EMAIL });
  if (emailTaken) {
    return {
      ok: false,
      created: false,
      message: 'Admin seed skipped: admin@harborhouse.local is already registered.',
    };
  }

  const userTaken = await User.findOne({ username: ADMIN_USERNAME });
  if (userTaken) {
    return {
      ok: false,
      created: false,
      message: 'Admin seed skipped: username "admin" is already taken.',
    };
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: hash,
    role: 'admin',
  });
  return {
    ok: true,
    created: true,
    message: `Seeded admin (username: ${ADMIN_USERNAME}, password: ${ADMIN_PASSWORD}, email: ${ADMIN_EMAIL}).`,
  };
}
