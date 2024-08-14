const express = require('express');
const bodyParser = require('body-parser');
const { expressjwt: expressJwt } = require('express-jwt');
const bcrypt = require('bcryptjs');
const { User, GameEvent } = require('./database/models');
const { generateToken } = require('./utils/auth');
const app = express();
const port = 3000;

const secretKey = process.env.JWT_SECRET || 'yourSecretKey';

// JWT authentication middleware
app.use(
  expressJwt({ secret: secretKey, algorithms: ['HS256'] }).unless({
    path: [
      { url: '/api/user', methods: ['POST'] },  // Only allow POST /api/user without authentication
      '/api/sessions', 
      '/health'
    ],
  })
);

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

app.get('/health', async (req, res) => {
  res.status(200).send('OK, it works!');
});

// Register user route
app.post('/api/user', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user route
app.post('/api/sessions', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/user/game_events - Report a game completion event
app.post('/api/user/game_events', async (req, res) => {
  const { type, occurred_at, game_id } = req.body.game_event;

  if (type !== 'COMPLETED') {
    return res.status(400).json({ message: 'Invalid event type' });
  }

  try {
    const newGameEvent = await GameEvent.create({
      type,
      occurred_at,
      game_id,
      user_id: req.auth.id, // Assuming the user ID is stored in the JWT token's payload
    });

    res.status(201).json(newGameEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user - Get user details and game stats
app.get('/api/user', async (req, res) => {
  try {
    const user = await User.findByPk(req.auth.id, {
      include: [{
        model: GameEvent,
        where: { type: 'COMPLETED' },
        required: false
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalGamesPlayed = user.GameEvents ? user.GameEvents.length : 0;

    res.json({
      user: {
        id: user.id,
        email: user.username,  // Assuming username is used as email
        stats: {
          total_games_played: totalGamesPlayed
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
