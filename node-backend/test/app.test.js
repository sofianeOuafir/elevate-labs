const request = require('supertest');
const { sequelize } = require('../database/models');

const app = process.env.NODE_BACKEND_URL;

beforeAll(async () => {
  await sequelize.query('TRUNCATE "GameEvents" CASCADE');
  await sequelize.query('TRUNCATE "Users" CASCADE');
});

afterAll(async () => {
  await sequelize.query('TRUNCATE "GameEvents" CASCADE');
  await sequelize.query('TRUNCATE "Users" CASCADE');
});

// Test user registration
describe('POST /api/user', () => {
  it('should register a new user and return a JWT token', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/user')
      .send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not allow duplicate registration of the same username', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/user')
      .send(newUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username already exists');
  });
});

// Test user login
describe('POST /api/sessions', () => {
  it('should log in an existing user and return a JWT token', async () => {
    const user = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/sessions')
      .send(user);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not log in with invalid credentials', async () => {
    const invalidUser = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    const res = await request(app)
      .post('/api/sessions')
      .send(invalidUser);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid username or password');
  });
});

// Test reporting game events
describe('POST /api/user/game_events', () => {
  let token;

  beforeAll(async () => {
    // Register a new user
    const newUser = {
      username: 'testuser',
      password: 'password123'
    };

    await request(app)
      .post('/api/user')
      .send(newUser);

    // Log in the newly registered user to get a JWT token
    const res = await request(app)
      .post('/api/sessions')
      .send(newUser);

    token = res.body.token; // Store the token for later use in tests
  });

  it('should report a game completion event', async () => {
    const gameEvent = {
      game_event: {
        type: 'COMPLETED',
        occurred_at: new Date(),
        game_id: 12346
      }
    };

    const res = await request(app)
      .post('/api/user/game_events')
      .set('Authorization', `Bearer ${token}`)
      .send(gameEvent);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toEqual('COMPLETED');
    expect(res.body.game_id).toEqual(12346);
    await sequelize.query('TRUNCATE "GameEvents" CASCADE');
  });

  it('should not report a game event with an invalid type', async () => {
    const invalidGameEvent = {
      game_event: {
        type: 'INVALID_TYPE',
        occurred_at: new Date(),
        game_id: 12345
      }
    };

    const res = await request(app)
      .post('/api/user/game_events')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidGameEvent);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid event type');
  });

  it('should return 401 Unauthorized for unauthenticated requests', async () => {
    const gameEvent = {
      game_event: {
        type: 'COMPLETED',
        occurred_at: new Date(),
        game_id: 12347
      }
    };

    const res = await request(app)
      .post('/api/user/game_events')
      .send(gameEvent); // No Authorization header

    expect(res.statusCode).toEqual(401);
  });
});


// Test getting user details with stats
describe('GET /api/user', () => {
  let token;

  beforeAll(async () => {
    // Register a new user
    const newUser = {
      username: 'testuser',
      password: 'password123'
    };

    await request(app)
      .post('/api/user')
      .send(newUser);

    // Log in the newly registered user to get a JWT token
    const res = await request(app)
      .post('/api/sessions')
      .send(newUser);

    token = res.body.token; // Store the token for later use in tests

    // Report a game event
    const gameEvent1 = {
      game_event: {
        type: 'COMPLETED',
        occurred_at: new Date(),
        game_id: 12345
      }
    };

    const gameEvent2 = {
      game_event: {
        type: 'COMPLETED',
        occurred_at: new Date(),
        game_id: 12346
      }
    };

    await request(app)
      .post('/api/user/game_events')
      .set('Authorization', `Bearer ${token}`)
      .send(gameEvent1);

    await request(app)
      .post('/api/user/game_events')
      .set('Authorization', `Bearer ${token}`)
      .send(gameEvent2);
  });

  it('should return user details and game stats', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', 'testuser');
    expect(res.body.user).toHaveProperty('stats');
    expect(res.body.user.stats).toHaveProperty('total_games_played', 2); // Two game events were reported
  });

  it('should return 401 Unauthorized for unauthenticated requests', async () => {
    const res = await request(app)
      .get('/api/user'); // No Authorization header

    expect(res.statusCode).toEqual(401);
  });

  it('should return accurate stats for multiple game events', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', 'testuser');
    expect(res.body.user).toHaveProperty('stats');
    expect(res.body.user.stats).toHaveProperty('total_games_played', 2); // Two game events were reported
  });
});


