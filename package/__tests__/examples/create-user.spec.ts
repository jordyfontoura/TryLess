import { ok, err, resultfy } from '../../src';

/**
 * Real-world example: User creation with validation
 */
describe('create user example', () => {
  interface ICreateUserAttributes {
    name: string;
    email: string;
    age: number;
  }

  interface IUser {
    id: number;
    name: string;
    email: string;
    age: number;
  }

  // Mock database
  let db: IUser[];

  beforeEach(() => {
    db = [
      {
        id: 123,
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 25,
      },
    ];
  });

  /**
   * Legacy function that throws errors
   */
  function worstFetchUser(email: string): IUser {
    const user = db.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Improved user creation function with proper error handling
   */
  function createUser(attributes: ICreateUserAttributes) {
    // Validation: name required
    if (!attributes.name) {
      return err('Validation', 'Name is required');
    }

    // Validation: email required
    if (!attributes.email) {
      return err('Validation', 'Email is required');
    }

    // Validation: age required
    if (!attributes.age) {
      return err('Validation', 'Age is required');
    }

    // Business rule: minimum age
    if (attributes.age < 18) {
      return err('Underage', 'User must be at least 18 years old');
    }

    // Validation: email format
    if (!attributes.email.includes('@')) {
      return err('EmailFormat', 'Email must be valid');
    }

    // Business rule: maximum age
    if (attributes.age > 200) {
      return err('AgeLimit', 'Age must be less than 200');
    }

    // Check if user already exists (wrapping legacy code)
    const existingUser = resultfy(worstFetchUser)(attributes.email);

    if (existingUser.success) {
      return err('UserExists', existingUser.data);
    }

    // Create new user
    const newUser: IUser = {
      id: db.length + 1,
      ...attributes,
    };

    db.push(newUser);

    return ok(newUser);
  }

  describe('successful user creation', () => {
    it('should create a user with valid attributes', () => {
      const attributes: ICreateUserAttributes = {
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('Alice');
        expect(result.data.age).toBe(25);
        expect(result.data.email).toBe('alice@example.com');
        expect(result.data.id).toBeDefined();
      }
    });

    it('should add user to database', () => {
      const attributes: ICreateUserAttributes = {
        name: 'Bob',
        age: 30,
        email: 'bob@example.com',
      };

      const initialLength = db.length;
      const result = createUser(attributes);

      expect(result.success).toBe(true);
      expect(db.length).toBe(initialLength + 1);
    });
  });

  describe('validation errors', () => {
    it('should reject missing name', () => {
      const attributes = {
        name: '',
        age: 25,
        email: 'test@example.com',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Validation');
        expect(result.reason).toBe('Name is required');
      }
    });

    it('should reject missing email', () => {
      const attributes = {
        name: 'Alice',
        age: 25,
        email: '',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Validation');
        expect(result.reason).toBe('Email is required');
      }
    });

    it('should reject missing age', () => {
      const attributes = {
        name: 'Alice',
        age: 0,
        email: 'alice@example.com',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Validation');
        expect(result.reason).toBe('Age is required');
      }
    });

    it('should reject invalid email format', () => {
      const attributes = {
        name: 'Alice',
        age: 25,
        email: 'invalid-email',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('EmailFormat');
        expect(result.reason).toBe('Email must be valid');
      }
    });
  });

  describe('business rule errors', () => {
    it('should reject underage users', () => {
      const attributes = {
        name: 'Young User',
        age: 16,
        email: 'young@example.com',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Underage');
        expect(result.reason).toBe('User must be at least 18 years old');
      }
    });

    it('should reject age above limit', () => {
      const attributes = {
        name: 'Old User',
        age: 250,
        email: 'old@example.com',
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('AgeLimit');
        expect(result.reason).toBe('Age must be less than 200');
      }
    });

    it('should reject existing users', () => {
      const attributes = {
        name: 'John Doe',
        age: 25,
        email: 'john.doe@example.com', // This email already exists in db
      };

      const result = createUser(attributes);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('UserExists');
        expect(result.reason).toEqual({
          id: 123,
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 25,
        });
      }
    });
  });

  describe('type narrowing', () => {
    it('should narrow types based on success property', () => {
      const attributes: ICreateUserAttributes = {
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      };

      const result = createUser(attributes);

      if (result.success) {
        // TypeScript should know this is Ok<IUser>
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBe('Alice');
      } else {
        // TypeScript should know this is Err with various error types
        expect(result.error).toBeDefined();
      }
    });

    it('should narrow error types based on error property', () => {
      const result = createUser({
        name: '',
        age: 25,
        email: 'test@example.com',
      });

      if (!result.success) {
        if (result.error === 'Validation') {
          // TypeScript should know reason is string
          expect(typeof result.reason).toBe('string');
        } else if (result.error === 'UserExists') {
          // TypeScript should know reason is IUser
          expect(result.reason).toHaveProperty('id');
        }
      }
    });
  });

  describe('error handling patterns', () => {
    it('should use early returns for validation', () => {
      // This test demonstrates the early return pattern
      const attributes = {
        name: '',
        age: 25,
        email: 'test@example.com',
      };

      const result = createUser(attributes);

      // Should fail on first validation error
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Validation');
      }
    });

    it('should wrap legacy code with resultfy', () => {
      // Test that we can safely wrap throwing functions
      const safeFetch = resultfy(worstFetchUser);

      const existingResult = safeFetch('john.doe@example.com');
      expect(existingResult.success).toBe(true);

      const notFoundResult = safeFetch('nonexistent@example.com');
      expect(notFoundResult.success).toBe(false);
    });
  });
});

