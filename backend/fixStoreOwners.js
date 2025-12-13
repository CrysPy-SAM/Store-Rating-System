// fixStoreOwners.js
// Run this script once to fix all store owners in your database

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStoreOwners() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    console.log('✅ Connected to database');

    // Step 1: Find all store owners without store_id
    const [brokenOwners] = await connection.query(`
      SELECT u.id, u.name, u.email, u.store_id, s.id as actual_store_id, s.name as store_name
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      WHERE u.role = 'store_owner'
    `);

    console.log('\n📊 Store Owners Status:');
    console.log('='.repeat(80));
    
    for (const owner of brokenOwners) {
      const status = owner.store_id ? '✅ LINKED' : '❌ NOT LINKED';
      console.log(`${status} | Owner: ${owner.name} | Email: ${owner.email}`);
      console.log(`         | User Store ID: ${owner.store_id} | Actual Store ID: ${owner.actual_store_id}`);
      console.log(`         | Store Name: ${owner.store_name || 'N/A'}`);
      console.log('-'.repeat(80));
    }

    // Step 2: Fix broken links
    console.log('\n🔧 Fixing broken links...\n');
    
    let fixedCount = 0;
    for (const owner of brokenOwners) {
      if (!owner.store_id && owner.actual_store_id) {
        await connection.query(
          'UPDATE users SET store_id = ? WHERE id = ?',
          [owner.actual_store_id, owner.id]
        );
        console.log(`✅ Fixed: ${owner.name} → Store ID: ${owner.actual_store_id}`);
        fixedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} store owner(s)`);

    // Step 3: Verify the fix
    const [verifyOwners] = await connection.query(`
      SELECT 
        u.id, 
        u.name as owner_name, 
        u.email,
        u.store_id,
        s.name as store_name,
        COUNT(r.id) as total_ratings,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN stores s ON u.store_id = s.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.role = 'store_owner'
      GROUP BY u.id, s.id
    `);

    console.log('\n📊 Final Status (After Fix):');
    console.log('='.repeat(80));
    for (const owner of verifyOwners) {
      console.log(`Owner: ${owner.owner_name}`);
      console.log(`Email: ${owner.email}`);
      console.log(`Store: ${owner.store_name || 'NOT LINKED'}`);
      console.log(`Store ID: ${owner.store_id || 'NULL'}`);
      console.log(`Total Ratings: ${owner.total_ratings}`);
      console.log(`Average Rating: ${owner.avg_rating}`);
      console.log('-'.repeat(80));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the fix
fixStoreOwners()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    console.log('💡 Now ask the store owner to logout and login again for the JWT token to update.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });