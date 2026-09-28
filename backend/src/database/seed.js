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
      ('Alex Johnson', 'user@example.com', '+1234567890', $1, 'user'),
      ('Sarah Chen', 'organizer@example.com', '+0987654321', $1, 'organizer'),
      ('Mike Williams', 'mike@example.com', '+1122334455', $1, 'user')
      RETURNING id, role
    `, [hashedPassword]);

    const organizerId = userResult.rows.find(r => r.role === 'organizer').id;
    const userId = userResult.rows.find(r => r.role === 'user' && true).id;

    // Seed events
    const eventsResult = await client.query(`
      INSERT INTO events (organizer_id, name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats) VALUES
      ($1, 'Summer Music Festival 2026', 'Experience an unforgettable summer with top artists performing live. Three stages, 20+ artists, food vendors, and a spectacular light show!', 'Music', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', '2026-10-15', '18:00', '23:00', 'Central Park Amphitheater', '123 Park Ave, New York, NY 10001', 79.99, 500, 320),
      ($1, 'Tech Innovation Summit', 'Join industry leaders and innovators for a day of talks, workshops, and networking. Explore the future of AI, Web3, and sustainable tech.', 'Technology', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', '2026-10-20', '09:00', '18:00', 'Silicon Valley Convention Center', '456 Tech Blvd, San Jose, CA 95002', 149.99, 300, 145),
      ($1, 'NBA All-Star Weekend', 'Watch the world''s best basketball players compete in the most exciting weekend in sports. Skills challenge, dunk contest, and the big game!', 'Sports', 'https://images.unsplash.com/photo-1546519638405-a9f41bb63a4f?w=800', '2026-10-25', '14:00', '22:00', 'Madison Square Garden', '4 Pennsylvania Plaza, New York, NY 10001', 199.99, 1000, 230),
      ($1, 'Business Leadership Conference', 'Connect with top executives and entrepreneurs. Learn strategies for growth, innovation, and leadership excellence in today''s competitive market.', 'Business', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800', '2026-11-05', '08:00', '17:00', 'Grand Hyatt Ballroom', '789 Business Ave, Chicago, IL 60601', 299.99, 200, 87),
      ($1, 'Digital Art & Design Workshop', 'A hands-on workshop covering UI/UX design, digital illustration, and motion graphics. Suitable for beginners and professionals alike.', 'Workshops', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', '2026-11-10', '10:00', '16:00', 'Creative Hub Studio', '321 Art Street, Austin, TX 78701', 49.99, 50, 22),
      ($1, 'EDM Night: Neon Dreams', 'The biggest electronic dance music event of the year. World-class DJs, stunning visuals, and an energy that will keep you dancing all night!', 'Entertainment', 'https://images.unsplash.com/photo-1571085255226-72b7c65b15e3?w=800', '2026-10-30', '21:00', '04:00', 'Club Spectrum', '555 Night Ave, Las Vegas, NV 89101', 89.99, 400, 178),
      ($1, 'Python & Machine Learning Bootcamp', 'Intensive 2-day bootcamp covering Python fundamentals, data science, and machine learning with real-world projects.', 'Education', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800', '2026-11-15', '09:00', '18:00', 'Code Academy Campus', '999 Learn Lane, Seattle, WA 98101', 399.99, 100, 45),
      ($1, 'Jazz Under the Stars', 'An intimate evening of world-class jazz music performed under the open sky. Featuring Grammy-winning artists and special surprise guests.', 'Music', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800', '2026-10-18', '19:30', '22:30', 'Rooftop Garden Venue', '777 Skyline Blvd, San Francisco, CA 94101', 59.99, 150, 89),
      ($1, 'Marathon & Fun Run 2026', 'Join thousands of runners in this annual city marathon event. Categories for all fitness levels from 5K fun run to full 42K marathon.', 'Sports', 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800', '2026-11-02', '06:00', '14:00', 'City Sports Park', '100 Runner''s Way, Boston, MA 02101', 35.00, 800, 612),
      ($1, 'Startup Pitch Competition', 'Watch promising startups pitch to top investors. Network with founders, VCs, and industry experts. Winner receives $50,000 in funding!', 'Business', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', '2026-11-20', '10:00', '18:00', 'Innovation Hub', '888 Venture Ave, San Francisco, CA 94102', 0, 250, 198)
      RETURNING id
    `, [organizerId]);

    const eventIds = eventsResult.rows.map(r => r.id);

    // Seed bookings for userId and mike
    await client.query(`
      INSERT INTO bookings (user_id, event_id, ticket_type, quantity, total_amount, status) VALUES
      ($1, $2, 'VIP', 2, 167.98, 'confirmed'),
      ($1, $3, 'General', 1, 157.49, 'confirmed'),
      ($4, $2, 'General', 1, 83.99, 'confirmed'),
      ($4, $5, 'General', 2, 104.98, 'pending')
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
