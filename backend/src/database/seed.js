require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const pool = require('./db');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM favorites');
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM events');
    await client.query('DELETE FROM users');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE favorites_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE notifications_id_seq RESTART WITH 1');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed users
    const userResult = await client.query(`
      INSERT INTO users (name, email, mobile, password, role) VALUES
      ('Aarav Sharma', 'user@example.com', '+91 98765 43210', $1, 'user'),
      ('Aryan Patel', 'organizer@example.com', '+91 98111 22334', $1, 'organizer'),
      ('Rohan Verma', 'mike@example.com', '+91 98222 33445', $1, 'user')
      RETURNING id, role
    `, [hashedPassword]);

    const organizerId = userResult.rows.find(r => r.role === 'organizer').id;
    const userId = userResult.rows.find(r => r.role === 'user' && true).id;

    // Seed events with Indian venues, addresses and INR prices
    const eventsResult = await client.query(`
      INSERT INTO events (organizer_id, name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats) VALUES
      ($1, 'Sunburn Arena Live 2026', 'Experience an unforgettable summer with top artists performing live. Multi-genre stages, 20+ artists, food trucks, and an immersive sound experience!', 'Music', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', '2026-10-15', '18:00', '23:00', 'Jio World Garden', 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051', 1499.00, 500, 320),
      ($1, 'India Tech Innovation Summit', 'Join industry leaders and innovators for a day of talks, workshops, and networking. Explore the future of AI, Web3, and sustainable tech in India.', 'Technology', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', '2026-10-20', '09:00', '18:00', 'KTPO Convention Centre', 'Whitefield Main Rd, EPIP Zone, Bengaluru, Karnataka 560066', 2999.00, 300, 145),
      ($1, 'IPL T20 Blockbuster Clash', 'Watch the country''s top cricket franchises clash under the floodlights in a thrilling high-octane stadium atmosphere.', 'Sports', 'https://images.unsplash.com/photo-1546519638405-a9f41bb63a4f?w=800', '2026-10-25', '19:30', '23:30', 'Wankhede Stadium', 'D Road, Churchgate, Mumbai, Maharashtra 400020', 1200.00, 1000, 230),
      ($1, 'National Business Leadership Conclave', 'Connect with India''s top executives, founders, and venture capitalists. Strategic insights for growth, scaling, and operational excellence.', 'Business', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800', '2026-11-05', '08:30', '17:30', 'The Leela Palace Ballroom', 'Old Airport Road, Kodihalli, Bengaluru, Karnataka 560008', 4999.00, 200, 87),
      ($1, 'Digital UI/UX & Figma Masterclass', 'A hands-on workshop covering product design, design systems, prototyping, and accessibility for modern web and mobile apps.', 'Workshops', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', '2026-11-10', '10:00', '16:00', '91springboard Tech Park', 'George Thangaiah Complex, Indiranagar, Bengaluru, Karnataka 560038', 799.00, 50, 22),
      ($1, 'Bollywood & EDM Sunsets Festival', 'The biggest dance music and fusion celebration on the coast. Headline DJs, sunset beach stage, and non-stop festival vibes.', 'Entertainment', 'https://images.unsplash.com/photo-1571085255226-72b7c65b15e3?w=800', '2026-10-30', '17:00', '02:00', 'Vagator Beach Grounds', 'Vagator Beach Road, Anjuna, Goa 403509', 1999.00, 400, 178),
      ($1, 'AI & GenAI Developers Bootcamp', 'Intensive 2-day bootcamp covering LLMs, LangChain, RAG pipelines, and model evaluation with real-world enterprise projects.', 'Education', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800', '2026-11-15', '09:00', '18:00', 'IIT Delhi Research Park', 'Hauz Khas, New Delhi, Delhi 110016', 3499.00, 100, 45),
      ($1, 'Acoustic Sufi & Jazz Rooftop Nights', 'An intimate open-air skyline evening featuring celebrated Indian fusion musicians and soulful live acoustic performances.', 'Music', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800', '2026-10-18', '19:30', '22:30', 'Aer Rooftop Lounge', 'Four Seasons Hotel, Worli, Mumbai, Maharashtra 400018', 899.00, 150, 89),
      ($1, 'Mumbai Coastal Marathon & 10K', 'Run along Mumbai''s scenic coastal route. Timed bibs, finisher medals, and hydration stations for all categories.', 'Sports', 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800', '2026-11-02', '05:30', '11:00', 'Bandra Fort Promenade', 'Byramji Jeejeebhoy Road, Bandra West, Mumbai, Maharashtra 400050', 599.00, 800, 612),
      ($1, 'Bengaluru Startup Pitch Fest 2026', 'Watch high-growth Indian startups pitch live to leading angel networks and venture capitalists. Free open admission for ecosystem builders.', 'Business', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', '2026-11-20', '10:00', '18:00', 'WeWork Galaxy', '43 Residency Road, Shanthala Nagar, Bengaluru, Karnataka 560025', 0, 250, 198)
      RETURNING id
    `, [organizerId]);

    const eventIds = eventsResult.rows.map(r => r.id);

    // Seed bookings for userId and mike with INR pricing
    await client.query(`
      INSERT INTO bookings (user_id, event_id, ticket_type, quantity, total_amount, status) VALUES
      ($1, $2, 'VIP', 2, 3147.90, 'confirmed'),
      ($1, $3, 'General', 1, 3148.95, 'confirmed'),
      ($4, $2, 'General', 1, 1573.95, 'confirmed'),
      ($4, $5, 'General', 2, 1677.90, 'pending')
    `, [userId, eventIds[0], eventIds[1], userResult.rows[2].id, eventIds[4]]);

    // Seed favorites for userId
    await client.query(`
      INSERT INTO favorites (user_id, event_id) VALUES
      ($1, $2),
      ($1, $3),
      ($1, $4)
    `, [userId, eventIds[0], eventIds[1], eventIds[5]]);

    // Seed notifications for userId
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
      ($1, 'Welcome to Eventify', 'Browse and book premium concerts, tech conferences, and workshops around you.', 'general', false),
      ($1, 'Booking Confirmed: Summer Music Festival', 'Your VIP tickets are ready in your Bookings tab.', 'booking', false),
      ($1, 'Reminder: Tech Innovation Summit', 'The summit starts in two weeks. Check your schedule and venue details.', 'reminder', true)
    `, [userId]);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   User:      user@example.com / password123');
    console.log('   Organizer: organizer@example.com / password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(console.error);
