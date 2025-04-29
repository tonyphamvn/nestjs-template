import { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'

import { UserSeeder } from './user'

export class DatabaseSeeder extends Seeder {
  run(em: EntityManager) {
    return this.call(em, [UserSeeder])
  }
}
