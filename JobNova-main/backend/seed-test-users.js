require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./src/config/database');

async function seedTestUsers() {
  console.log('🌱 Seeding test users...\n');

  const users = [
    {
      user_id: 'admin',
      phone: '03001111111',
      password: 'Admin123!',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User'
    },
    {
      user_id: 'employer_demo',
      phone: '03002222222',
      password: 'Employer123!',
      role: 'employer',
      first_name: 'Demo',
      last_name: 'Employer'
    },
    {
      user_id: 'white_demo',
      phone: '03003333333',
      password: 'White123!',
      role: 'white_collar',
      first_name: 'White',
      last_name: 'Collar'
    },
    {
      user_id: 'blue_demo',
      phone: '03004444444',
      password: 'Blue123!',
      role: 'blue_collar',
      first_name: 'Blue',
      last_name: 'Collar'
    }
  ];

  for (const user of users) {
    try {
      // Check if user exists
      const existing = await query(
        'SELECT id FROM users WHERE user_id = $1',
        [user.user_id]
      );

      if (existing.rows.length > 0) {
        console.log(`✓ User ${user.user_id} already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(user.password, salt);

      // Insert user
      const result = await query(
        `INSERT INTO users (user_id, phone, password_hash, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [user.user_id, user.phone, password_hash, user.role, user.first_name, user.last_name]
      );

      const userId = result.rows[0].id;

      // Create profile
      await query(
        `INSERT INTO profiles (user_id, full_name, bio, location)
         VALUES ($1, $2, $3, $4)`,
        [userId, `${user.first_name} ${user.last_name}`, `${user.role} test account`, 'Lahore, Pakistan']
      );

      console.log(`✓ Created user: ${user.user_id} (${user.role})`);
      console.log(`  Username: ${user.user_id}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Password: ${user.password}\n`);
    } catch (error) {
      console.error(`✗ Error creating ${user.user_id}:`, error.message);
    }
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('📝 Test credentials:');
  console.log('─'.repeat(50));
  console.log('Admin:    admin / Admin123!');
  console.log('Employer: employer_demo / Employer123!');
  console.log('White:    white_demo / White123!');
  console.log('Blue:     blue_demo / Blue123!');
  console.log('─'.repeat(50));

  process.exit(0);
}

seedTestUsers().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
