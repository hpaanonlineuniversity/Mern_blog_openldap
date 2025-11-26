// services/ldapService.js
import ldapjs from 'ldapjs';
import { LDAPUser } from '../models/ldap_user_model.js';

class LDAPService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = ldapjs.createClient({
        url: process.env.LDAP_URL || 'ldap://openldap:389',
        reconnect: true,
        timeout: 5000,
        bindDN: process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
        bindCredentials: process.env.LDAP_BIND_PASSWORD || 'adminpassword'
      });

      return new Promise((resolve, reject) => {
        this.client.on('connect', () => {
          console.log('✅ Connected to LDAP server');
          this.isConnected = true;
          resolve();
        });

        this.client.on('error', (err) => {
          console.error('❌ LDAP connection error:', err);
          this.isConnected = false;
          reject(err);
        });

        this.client.on('connectTimeout', () => {
          console.error('❌ LDAP connection timeout');
          this.isConnected = false;
          reject(new Error('LDAP connection timeout'));
        });
      });
    } catch (error) {
      console.error('❌ Failed to create LDAP client:', error);
      throw error;
    }
  }

  async bind() {
    if (!this.client) {
      throw new Error('LDAP client not initialized');
    }

    return new Promise((resolve, reject) => {
      this.client.bind(
        process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
        process.env.LDAP_BIND_PASSWORD || 'adminpassword',
        (err) => {
          if (err) {
            console.error('❌ LDAP bind failed:', err);
            reject(err);
          } else {
            console.log('✅ LDAP bind successful');
            resolve();
          }
        }
      );
    });
  }

  async authenticate(username, password) {
  try {
    if (!this.isConnected) {
      await this.connect();
      await this.bind();
    }

    // First, find the user's DN
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('User found:', user);
    console.log('User attributes:', user.attributes);
    
    // DN ကို string အဖြစ် ပြောင်းပါ
    const userDN = typeof user.dn === 'string' ? user.dn : 
                  user.dn.toString ? user.dn.toString() : 
                  String(user.dn);

    console.log('Authenticating with DN:', userDN);

    return new Promise((resolve, reject) => {
      const authClient = ldapjs.createClient({
        url: process.env.LDAP_URL,
        reconnect: true,
        timeout: 5000,
        connectTimeout: 5000
      });

      authClient.on('error', (err) => {
        console.error('Auth client error:', err);
      });

      authClient.bind(userDN, password, (err) => {
        if (err) {
          console.error('Authentication bind error:', err.message);
          authClient.destroy();
          reject(new Error('Invalid credentials'));
        } else {
          console.log('Authentication successful for:', username);
          console.log('User object before resolve:', user);
          console.log('User JSON:', user.toJSON());
          authClient.unbind();
          resolve(user);
        }
      });
    });
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

  async findUserByUsername(username) {
  try {
    return new Promise((resolve, reject) => {
      const searchOptions = {
        filter: `(uid=${username})`,
        scope: 'sub',
        attributes: ['dn', 'uid', 'cn', 'sn', 'mail', 'isAdmin', 'CreateAt', 'UpdateAt'] // All needed attributes
      };

      this.client.search('ou=users,dc=example,dc=com', searchOptions, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        let userFound = null;

        res.on('searchEntry', (entry) => {
          console.log('Found user entry:', entry.object);
          
          // Properly create LDAPUser with attributes
          userFound = new LDAPUser(
            entry.objectName.toString(), // DN as string
            entry.object // All attributes
          );
        });

        res.on('error', (err) => {
          reject(err);
        });

        res.on('end', () => {
          if (userFound) {
            console.log('User attributes:', userFound.attributes);
            resolve(userFound);
          } else {
            resolve(null);
          }
        });
      });
    });
  } catch (error) {
    console.error('Find user error:', error);
    throw error;
  }
}

  async initializeLDAPStructure() {
    try {
      await this.ensureOUExists();
      console.log('✅ LDAP structure initialized');
    } catch (error) {
      console.error('Error initializing LDAP structure:', error);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.unbind();
      this.isConnected = false;
      console.log('🔌 Disconnected from LDAP server');
    }
  }
}

export const ldapService = new LDAPService();