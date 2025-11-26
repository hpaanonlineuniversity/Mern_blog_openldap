// services/ldap_service.js
import ldapjs from 'ldapjs';
import { errorHandler } from '../utils/error.js';

export class LDAPService {
  constructor() {
    this.client = ldapjs.createClient({
      url: process.env.LDAP_URL || 'ldap://localhost:389',
      timeout: 5000,
      connectTimeout: 10000
    });

    this.baseDN = process.env.LDAP_BASE_DN || 'dc=example,dc=com';
    this.usersDN = `ou=users,${this.baseDN}`;
    
    this.client.on('error', (err) => {
      console.error('LDAP connection error:', err);
    });
  }

  // LDAP ကို bind လုပ်ဖို့ method
  async bind(dn, password) {
    return new Promise((resolve, reject) => {
      this.client.bind(dn, password, (err) => {
        if (err) {
          reject(errorHandler(401, 'Invalid credentials'));
        } else {
          resolve(true);
        }
      });
    });
  }

  // User ရှာဖွေဖို့ method
  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const options = {
        filter: `(&(objectClass=exampleUser)(mail=${email}))`,
        scope: 'sub',
        attributes: ['*', '+']
      };

      this.client.search(this.usersDN, options, (err, res) => {
        if (err) {
          reject(errorHandler(500, 'LDAP search error'));
          return;
        }

        let userFound = null;

        res.on('searchEntry', (entry) => {
          userFound = entry;
        });

        res.on('error', (err) => {
          reject(errorHandler(500, 'LDAP search error'));
        });

        res.on('end', () => {
          if (userFound) {
            resolve(userFound);
          } else {
            reject(errorHandler(404, 'User not found'));
          }
        });
      });
    });
  }

  // User အသစ် ဖန်တီးဖို့ method
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password, profilePicture, isAdmin } = userData;
      
      const userDN = `uid=${username},${this.usersDN}`;
      
      const entry = {
        uid: username,
        cn: username,
        sn: username,
        mail: email,
        userPassword: password,
        objectClass: ['exampleUser', 'inetOrgPerson', 'organizationalPerson', 'person', 'top'],
        profilePicture: profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        isAdmin: isAdmin ? 'true' : 'false',
        CreateAt: new Date().toISOString(),
        UpdateAt: new Date().toISOString()
      };

      this.client.add(userDN, entry, (err) => {
        if (err) {
          if (err.code === 68) { // Already exists
            reject(errorHandler(409, 'User already exists'));
          } else {
            reject(errorHandler(500, 'Failed to create user'));
          }
        } else {
          resolve({ dn: userDN, ...entry });
        }
      });
    });
  }

  // Admin user အနေနဲ့ bind လုပ်ဖို့
  async adminBind() {
    const adminDN = process.env.LDAP_ADMIN_DN || `cn=admin,${this.baseDN}`;
    const adminPassword = process.env.LDAP_ADMIN_PASSWORD;
    
    return this.bind(adminDN, adminPassword);
  }

  // Connection ပိတ်ဖို့
  close() {
    this.client.unbind();
  }
}

export const ldapService = new LDAPService();