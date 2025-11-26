// server.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { ldapService } from './services/ldapService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'LDAP Authentication API',
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      users: 'GET /api/auth/users',
      createUser: 'POST /api/auth/users'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await ldapService.connect();
    await ldapService.bind();
    
    res.json({
      status: 'healthy',
      ldap: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      ldap: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize LDAP connection and structure on startup
async function initializeApp() {
  try {
    await ldapService.connect();
    await ldapService.bind();
    await ldapService.initializeLDAPStructure();
    console.log('✅ LDAP service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize LDAP service:', error);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  initializeApp();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔌 Shutting down gracefully...');
  ldapService.disconnect();
  process.exit(0);
});