import { randomBytes } from 'crypto';

class PasswordManager {
  private adminPassword: string;

  constructor() {
    // Generate a random 12-character password
    this.adminPassword = randomBytes(6).toString('hex');
    console.log('='.repeat(50));
    console.log('🔐 ADMIN PASSWORD GENERATED');
    console.log('='.repeat(50));
    console.log(`Password: ${this.adminPassword}`);
    console.log('Use this password to edit/delete matches');
    console.log('='.repeat(50));
  }

  verifyPassword(password: string): boolean {
    return password === this.adminPassword;
  }

  getPassword(): string {
    return this.adminPassword;
  }
}

export const passwordManager = new PasswordManager();
