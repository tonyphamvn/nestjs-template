'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        id: 'user-1',
        email: 'user@example.com',
        username: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { id: 'user-1' })
  },
}
