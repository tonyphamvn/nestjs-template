import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { User } from '../entities'

export class UserSeeder extends Seeder {
  async run(em: EntityManager) {
    const user = em.create(User, {
      email: 'user@example.com',
      username: 'user',
    })

    await em.persistAndFlush(user)
  }
}
