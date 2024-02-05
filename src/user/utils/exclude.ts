import { User } from '@prisma/client';

function exclude(users: User[], keys: string[]) {
  for (const user of users) {
    for (const key of keys) {
      delete user[key];
    }
  }

  return users;
}

export default exclude;
