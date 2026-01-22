/**
 * Database Connection Test Script
 * Run with: npm run test:db
 */

require('dotenv').config();
const { Pool } = require('pg');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'n8n',
  user: process.env.DB_USER || 'n8n',
  password: process.env.DB_PASSWORD,
};

console.log('\n🔍 Testing Database Connection...\n');
console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Database: ${config.database}`);
console.log(`  User: ${config.user}`);
console.log(`  Password: ${config.password ? '***' : '(not set)'}\n`);

async function testConnection() {
  const pool = new Pool(config);

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const result = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log(`   ✅ Connected! Server time: ${result.rows[0].time}`);
    console.log(`   ✅ Database: ${result.rows[0].db}\n`);

    // Test security_articles table
    console.log('2. Testing security_articles table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'security_articles'
      ) as exists
    `);

    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Table security_articles exists\n');

      // Count articles
      console.log('3. Counting articles...');
      const countResult = await pool.query('SELECT COUNT(*) as count FROM security_articles');
      console.log(`   ✅ Total articles: ${countResult.rows[0].count}\n`);

      // Get latest article
      if (parseInt(countResult.rows[0].count) > 0) {
        console.log('4. Fetching latest article...');
        const latestResult = await pool.query(`
          SELECT id, title, source, category, priority
          FROM security_articles
          ORDER BY id DESC
          LIMIT 1
        `);
        const latest = latestResult.rows[0];
        console.log('   ✅ Latest article:');
        console.log(`      ID: ${latest.id}`);
        console.log(`      Title: ${latest.title?.substring(0, 60)}...`);
        console.log(`      Source: ${latest.source}`);
        console.log(`      Category: ${latest.category}`);
        console.log(`      Priority: ${latest.priority}\n`);

        // Check categories
        console.log('5. Checking available categories...');
        const categoriesResult = await pool.query(`
          SELECT category, COUNT(*) as count
          FROM security_articles
          WHERE category IS NOT NULL
          GROUP BY category
          ORDER BY count DESC
          LIMIT 5
        `);
        console.log('   ✅ Top categories:');
        categoriesResult.rows.forEach(r => {
          console.log(`      - ${r.category}: ${r.count} articles`);
        });
        console.log();

        // Check priorities
        console.log('6. Checking priorities...');
        const prioritiesResult = await pool.query(`
          SELECT priority, COUNT(*) as count
          FROM security_articles
          WHERE priority IS NOT NULL
          GROUP BY priority
          ORDER BY
            CASE priority
              WHEN 'High' THEN 1
              WHEN 'Medium' THEN 2
              WHEN 'Low' THEN 3
              ELSE 4
            END
        `);
        console.log('   ✅ Priority breakdown:');
        prioritiesResult.rows.forEach(r => {
          console.log(`      - ${r.priority}: ${r.count} articles`);
        });
        console.log();
      }
    } else {
      console.log('   ❌ Table security_articles does NOT exist\n');
      console.log('   You may need to run your n8n workflows first to create and populate the table.\n');
    }

    // Test security_newsletters table
    console.log('7. Testing security_newsletters table...');
    const newsletterCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'security_newsletters'
      ) as exists
    `);

    if (newsletterCheck.rows[0].exists) {
      const nlCount = await pool.query('SELECT COUNT(*) as count FROM security_newsletters');
      console.log(`   ✅ Table security_newsletters exists (${nlCount.rows[0].count} records)\n`);
    } else {
      console.log('   ⚠️  Table security_newsletters does not exist\n');
    }

    console.log('✅ All tests passed! Database is ready.\n');
    console.log('You can now start the API with: npm start\n');

  } catch (error) {
    console.log(`\n❌ Connection failed: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      console.log('Troubleshooting tips:');
      console.log('  1. Ensure PostgreSQL is running');
      console.log('  2. Check if the port 5432 is correct');
      console.log('  3. If using Docker, ensure the container is running');
      console.log('     Run: docker ps | grep postgres\n');
    }

    if (error.code === '28P01') {
      console.log('Troubleshooting tips:');
      console.log('  1. Check your DB_PASSWORD in .env file');
      console.log('  2. Verify the password matches your PostgreSQL configuration\n');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
