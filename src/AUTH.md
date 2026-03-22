# Authentication Module (`src/auth.js`)

Provides secure username/password authentication following OWASP best practices.

## Features

- **bcrypt password hashing** — passwords are never stored in plaintext.
- **Password strength validation** — enforces length, upper/lowercase, digit, and special-character rules.
- **Username validation** — alphanumeric + `_`, `-`, `.` characters; 3–64 chars.
- **Case-insensitive usernames** — stored and compared in lowercase.
- **Timing-attack prevention** — a dummy bcrypt comparison is performed even when the username is not found, preventing user enumeration via timing differences.
- **Pluggable user store** — defaults to an in-memory store; swap in any database adapter.

## API

### `new AuthManager([options])`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `store` | object | `InMemoryUserStore` | Custom storage adapter (`findByUsername`, `save`, `count`, `clear`). |
| `saltRounds` | number | `12` | bcrypt work factor. OWASP recommends ≥ 10. |

### `auth.register(username, password)` → `Promise<User>`

Registers a new user. Throws if:
- `username` is invalid (too short, invalid characters, etc.).
- `password` is too weak (see strength requirements below).
- `username` is already taken (case-insensitive).

Returns `{ id, username, createdAt }` — **never includes `passwordHash`**.

### `auth.login(username, password)` → `Promise<User>`

Authenticates a user. Throws `"Invalid username or password"` if credentials are wrong (generic message to prevent user enumeration).

### `auth.isUsernameAvailable(username)` → `boolean`

Returns `true` if the username is not yet registered.

### `validatePasswordStrength(password)` → `{ valid: boolean, errors: string[] }`

Validates a password against OWASP minimum requirements:

| Rule | Value |
|------|-------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Uppercase letter | Required |
| Lowercase letter | Required |
| Number | Required |
| Special character | Required (`!@#$%^&*...`) |

### `validateUsername(username)` → `{ valid: boolean, errors: string[] }`

Validates a username: 3–64 characters, letters/numbers/`_`/`-`/`.` only.

## Usage

```javascript
const { AuthManager } = require('./auth');

const auth = new AuthManager();

// Register
const user = await auth.register('alice', 'S3cur3P@ss!');
console.log(user); // { id, username: 'alice', createdAt }

// Login
const loggedIn = await auth.login('alice', 'S3cur3P@ss!');

// Check availability
auth.isUsernameAvailable('bob'); // true
```

## Security Notes

- **Never log or return `passwordHash`** — the module enforces this by design.
- **bcrypt work factor** of 12 is the default; increase it as hardware improves.
- Passwords are validated **before** hashing to avoid wasting CPU on invalid inputs.
- The dummy-hash login path prevents timing-based user enumeration.
- For production, replace `InMemoryUserStore` with a persistent, encrypted database.
