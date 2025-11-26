// models/ldap_user_model.js
import ldapjs from 'ldapjs';

export class LDAPUser {
  constructor(dn, attributes) {
    this.dn = dn;
    this.attributes = attributes;
  }

  // LDAP attribute mappings
  get uid() { return this.attributes.uid?.[0] || ''; }
  get username() { return this.attributes.uid?.[0] || ''; }
  get email() { return this.attributes.mail?.[0] || ''; }
  get profilePicture() { return this.attributes.profilePicture?.[0] || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; }
  get isAdmin() { return this.attributes.isAdmin?.[0] === 'true' || false; }
  get createdAt() { return this.attributes.createTimestamp?.[0] || new Date(); }
  get updatedAt() { return this.attributes.modifyTimestamp?.[0] || new Date(); }

  toJSON() {
    return {
      dn: this.dn,
      username: this.username,
      email: this.email,
      profilePicture: this.profilePicture,
      isAdmin: this.isAdmin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}