# Hello Bitcoin Module

## Overview

The Hello Bitcoin module provides a simple and fun greeting system for Bitcoin enthusiasts. It's designed as an educational starting point for developers new to Bitcoin and blockchain development, demonstrating basic module structure, state management, and API design patterns used throughout the Big World Bigger Ideas project.

## Features

- 👋 **Simple Greetings**: Basic Bitcoin greetings with customizable names
- 💬 **Custom Messages**: Add your own messages to greetings
- 🎩 **Formal Greetings**: Professional Bitcoin introduction messages
- 😊 **Emoji Greetings**: Fun greetings with random Bitcoin-themed emojis
- 📊 **Bitcoin Information**: Access basic Bitcoin facts and data
- 📜 **Greeting History**: Track all greetings with timestamps
- 🔄 **Name Management**: Change the greeting name dynamically
- 🔄 **Reset Functionality**: Clear history and start fresh
- 📝 **Formatted Output**: Built-in formatting for display

## Installation

No additional dependencies required beyond Node.js standard library.

## Quick Start

```javascript
const HelloBitcoin = require('./src/hello-bitcoin.js');

// Create a greeting instance
const hello = new HelloBitcoin('World');

// Send a simple greeting
console.log(hello.greet());
// Output: Hello Bitcoin from World! 🌍

// Send a custom greeting
console.log(hello.greetWithMessage('Welcome to decentralization!'));
// Output: Hello Bitcoin! Welcome to decentralization! - from World
```

## API Reference

### Constructor

#### `new HelloBitcoin(name)`

Creates a new Hello Bitcoin instance.

**Parameters:**
- `name` (string, optional): The name to use in greetings. Default: `'World'`

**Example:**
```javascript
// Use default name
const hello = new HelloBitcoin();

// Use custom name
const hello = new HelloBitcoin('Satoshi');
```

### Methods

#### `greet()`

Generates a simple Bitcoin greeting.

**Returns:** `string` - The Bitcoin greeting message

**Example:**
```javascript
const hello = new HelloBitcoin('Alice');
const message = hello.greet();
console.log(message);
// Output: Hello Bitcoin from Alice! 🌍
```

---

#### `greetWithMessage(customMessage)`

Generates a Bitcoin greeting with a custom message.

**Parameters:**
- `customMessage` (string): Custom message to include in the greeting

**Returns:** `string` - The custom Bitcoin greeting

**Throws:** `Error` if customMessage is not a non-empty string

**Example:**
```javascript
const hello = new HelloBitcoin('Bob');
const message = hello.greetWithMessage('Welcome to the future!');
console.log(message);
// Output: Hello Bitcoin! Welcome to the future! - from Bob
```

---

#### `formalGreet()`

Generates a formal Bitcoin greeting with educational context.

**Returns:** `string` - The formal Bitcoin greeting

**Example:**
```javascript
const hello = new HelloBitcoin('Carol');
const message = hello.formalGreet();
console.log(message);
// Output: Greetings from Carol. Welcome to the Bitcoin network, the first decentralized cryptocurrency!
```

---

#### `greetWithEmoji()`

Generates a Bitcoin greeting with a random emoji.

**Returns:** `string` - The emoji Bitcoin greeting

**Example:**
```javascript
const hello = new HelloBitcoin('Dave');
const message = hello.greetWithEmoji();
console.log(message);
// Output: ₿ Hello Bitcoin ₿ - Dave says hi!
// (Emoji varies randomly: ₿, 🚀, 💰, ⚡, 🌟, 🔗, 💎, 🌙)
```

---

#### `getBitcoinInfo()`

Gets comprehensive information about Bitcoin.

**Returns:** `object` - Bitcoin information including:
- `name`: Bitcoin
- `symbol`: BTC
- `creator`: Satoshi Nakamoto
- `launched`: Year of launch
- `type`: Cryptocurrency
- `consensus`: Consensus mechanism
- `maxSupply`: Maximum supply
- `blockTime`: Average block time
- `description`: Brief description

**Example:**
```javascript
const hello = new HelloBitcoin();
const info = hello.getBitcoinInfo();
console.log(info.name);      // Bitcoin
console.log(info.symbol);    // BTC
console.log(info.creator);   // Satoshi Nakamoto
```

---

#### `getHistory()`

Gets the complete greeting history.

**Returns:** `array` - Array of greeting objects, each containing:
- `message`: The greeting message
- `timestamp`: When the greeting was sent (Date object)
- `count`: The greeting number

**Example:**
```javascript
const hello = new HelloBitcoin('Eve');
hello.greet();
hello.greetWithMessage('Test');
const history = hello.getHistory();
console.log(history.length);  // 2
console.log(history[0].message);
console.log(history[0].timestamp);
```

---

#### `getGreetingCount()`

Gets the total number of greetings sent.

**Returns:** `number` - The greeting count

**Example:**
```javascript
const hello = new HelloBitcoin('Frank');
hello.greet();
hello.greet();
console.log(hello.getGreetingCount());  // 2
```

---

#### `reset()`

Resets the greeting counter and clears the history.

**Example:**
```javascript
const hello = new HelloBitcoin('Grace');
hello.greet();
hello.greet();
console.log(hello.getGreetingCount());  // 2
hello.reset();
console.log(hello.getGreetingCount());  // 0
```

---

#### `setName(newName)`

Changes the name used in greetings.

**Parameters:**
- `newName` (string): The new name to use

**Throws:** `Error` if newName is not a non-empty string

**Example:**
```javascript
const hello = new HelloBitcoin('Heidi');
console.log(hello.greet());  // Hello Bitcoin from Heidi! 🌍
hello.setName('Ivan');
console.log(hello.greet());  // Hello Bitcoin from Ivan! 🌍
```

---

#### `formatHistory()`

Formats the greeting history for display.

**Returns:** `string` - Formatted history output

**Example:**
```javascript
const hello = new HelloBitcoin('Judy');
hello.greet();
hello.formalGreet();
console.log(hello.formatHistory());
/*
Output:
Hello Bitcoin Greeting History
================================

Total Greetings: 2
Name: Judy

1. Hello Bitcoin from Judy! 🌍
   Time: 2024-01-01T12:00:00.000Z
   Count: 1

2. Greetings from Judy. Welcome to the Bitcoin network...
   Time: 2024-01-01T12:00:01.000Z
   Count: 2
*/
```

## Emoji Collection

The `greetWithEmoji()` method randomly selects from these Bitcoin-themed emojis:

- ₿ - Bitcoin symbol
- 🚀 - To the moon!
- 💰 - Money/wealth
- ⚡ - Lightning Network
- 🌟 - Shine/excellence
- 🔗 - Blockchain link
- 💎 - Diamond hands
- 🌙 - Moon (as in "to the moon")

## Testing

Run the module tests:

```bash
# Run Hello Bitcoin tests only
npm run test:hello-bitcoin

# Run all tests (includes Hello Bitcoin)
npm test
```

## Demo

Run the interactive demo:

```bash
npm run hello-bitcoin:demo
```

The demo demonstrates:
- Basic greetings
- Custom messages
- Formal greetings
- Emoji greetings
- Bitcoin information
- Greeting history
- Name management
- Reset functionality
- Practical usage scenarios

## Use Cases

### 1. Simple Welcome Message

```javascript
const hello = new HelloBitcoin('New User');
console.log(hello.greet());
```

### 2. Educational Bitcoin Bot

```javascript
const eduBot = new HelloBitcoin('Bitcoin Educator');
console.log(eduBot.formalGreet());
const info = eduBot.getBitcoinInfo();
console.log(`Learn about ${info.name}, created by ${info.creator}`);
```

### 3. Greeting Multiple Users

```javascript
const greeter = new HelloBitcoin();
const users = ['Alice', 'Bob', 'Charlie'];

users.forEach(user => {
  greeter.setName(user);
  console.log(greeter.greetWithEmoji());
});

console.log(`Sent ${greeter.getGreetingCount()} greetings!`);
```

### 4. Tracking Greeting Activity

```javascript
const tracker = new HelloBitcoin('Activity Tracker');
tracker.greet();
tracker.greetWithMessage('First Bitcoin transaction!');
tracker.formalGreet();

console.log(tracker.formatHistory());
```

### 5. Fun Social Media Bot

```javascript
const socialBot = new HelloBitcoin('Bitcoin Bot');

// Random fun greetings
for (let i = 0; i < 5; i++) {
  console.log(socialBot.greetWithEmoji());
}
```

## Best Practices

1. **Choose Appropriate Greeting Types**: Use `formalGreet()` for professional contexts, `greetWithEmoji()` for fun/casual contexts
2. **Track History**: Use `getHistory()` to monitor greeting patterns and engagement
3. **Reset When Needed**: Call `reset()` to start fresh in new contexts or sessions
4. **Validate Input**: The module validates inputs automatically, but wrap in try-catch for user-provided data
5. **Use Bitcoin Info**: Share `getBitcoinInfo()` data to educate users about Bitcoin

## Error Handling

The module provides clear error messages for invalid inputs:

```javascript
const hello = new HelloBitcoin('Test');

try {
  // This will throw an error
  hello.greetWithMessage('');
} catch (error) {
  console.error('Error:', error.message);
  // Output: Error: Custom message must be a non-empty string
}

try {
  // This will throw an error
  hello.setName(null);
} catch (error) {
  console.error('Error:', error.message);
  // Output: Error: Name must be a non-empty string
}
```

## Limitations

- **Memory Usage**: History is stored in memory; for long-running applications, consider calling `reset()` periodically
- **No Persistence**: Greeting history is not persisted between sessions
- **Single Instance**: Each instance maintains its own state independently

## Extending the Module

This module serves as a template for creating more complex Bitcoin utilities. Consider extending it with:

- Persistence layer for history (database or file storage)
- Integration with Bitcoin RPC for real data
- Multi-language support
- Custom emoji sets
- Webhook notifications
- Analytics and reporting

## Contributing

To contribute to this module:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## Educational Value

This module is designed for:
- **Beginners**: Learn basic Node.js module structure
- **Bitcoin Newcomers**: Get introduced to Bitcoin concepts
- **Developers**: See patterns used in the project
- **Students**: Study state management and API design

## License

ISC License - See repository root for details

## Author

**Matthew Brace (kushmanmb)**
- GitHub: [@Kushmanmb](https://github.com/Kushmanmb)
- Website: [kushmanmb.org](https://kushmanmb.org)
- Email: kushmanmb@gmx.com
- ENS: kushmanmb.eth

---

**Part of the Big World Bigger Ideas project**  
*Empowering crypto clarity, fueled by innovation and style*

## Related Modules

- **bitcoin-mining.js** - Fetch Bitcoin mining data and statistics
- **wallet.js** - Wallet encryption and security utilities
- **feature-flags.js** - Feature flag management
- **erc721.js** - NFT token utilities

---

*"Hello Bitcoin! The future of money starts here."* 🌏💰
