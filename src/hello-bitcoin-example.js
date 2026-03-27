/**
 * Hello Bitcoin Module Example
 * Demonstrates how to use the Hello Bitcoin greeting system
 */

const HelloBitcoin = require('./hello-bitcoin.js');

function runExample() {
  console.log('🌏 Big World Bigger Ideas - Hello Bitcoin Example\n');
  console.log('=' .repeat(60));
  
  // Example 1: Create a basic Hello Bitcoin instance
  console.log('\n📦 Example 1: Basic Greeting');
  console.log('=' .repeat(60));
  const hello1 = new HelloBitcoin();
  console.log(hello1.greet());
  
  // Example 2: Create with custom name
  console.log('\n📦 Example 2: Custom Name Greeting');
  console.log('=' .repeat(60));
  const hello2 = new HelloBitcoin('Matthew Brace');
  console.log(hello2.greet());
  
  // Example 3: Greet with custom message
  console.log('\n💬 Example 3: Custom Message Greeting');
  console.log('=' .repeat(60));
  const hello3 = new HelloBitcoin('kushmanmb');
  console.log(hello3.greetWithMessage('Welcome to the future of money!'));
  console.log(hello3.greetWithMessage('Decentralization is the way!'));
  
  // Example 4: Formal greeting
  console.log('\n🎩 Example 4: Formal Greeting');
  console.log('=' .repeat(60));
  const hello4 = new HelloBitcoin('Satoshi Nakamoto');
  console.log(hello4.formalGreet());
  
  // Example 5: Greeting with emoji
  console.log('\n😊 Example 5: Emoji Greeting (Random)');
  console.log('=' .repeat(60));
  const hello5 = new HelloBitcoin('Crypto Enthusiast');
  console.log(hello5.greetWithEmoji());
  console.log(hello5.greetWithEmoji());
  console.log(hello5.greetWithEmoji());
  
  // Example 6: Get Bitcoin information
  console.log('\n📊 Example 6: Bitcoin Information');
  console.log('=' .repeat(60));
  const hello6 = new HelloBitcoin();
  const info = hello6.getBitcoinInfo();
  console.log('Bitcoin Information:');
  console.log(`  Name: ${info.name}`);
  console.log(`  Symbol: ${info.symbol}`);
  console.log(`  Creator: ${info.creator}`);
  console.log(`  Launched: ${info.launched}`);
  console.log(`  Type: ${info.type}`);
  console.log(`  Consensus: ${info.consensus}`);
  console.log(`  Max Supply: ${info.maxSupply}`);
  console.log(`  Block Time: ${info.blockTime}`);
  console.log(`  Description: ${info.description}`);
  
  // Example 7: Multiple greetings and history
  console.log('\n📜 Example 7: Greeting History');
  console.log('=' .repeat(60));
  const hello7 = new HelloBitcoin('Bitcoin Developer');
  hello7.greet();
  hello7.greetWithMessage('Building on Bitcoin!');
  hello7.formalGreet();
  hello7.greetWithEmoji();
  
  console.log(`\nTotal Greetings: ${hello7.getGreetingCount()}`);
  console.log('\nGreeting History:');
  const history = hello7.getHistory();
  history.forEach((greeting, index) => {
    console.log(`  ${index + 1}. "${greeting.message}"`);
    console.log(`     Time: ${greeting.timestamp.toISOString()}`);
  });
  
  // Example 8: Formatted history
  console.log('\n📝 Example 8: Formatted History');
  console.log('=' .repeat(60));
  const hello8 = new HelloBitcoin('Alice');
  hello8.greet();
  hello8.greetWithMessage('First Bitcoin transaction!');
  hello8.formalGreet();
  console.log(hello8.formatHistory());
  
  // Example 9: Changing name
  console.log('\n🔄 Example 9: Changing Name');
  console.log('=' .repeat(60));
  const hello9 = new HelloBitcoin('Bob');
  console.log('Original name:', hello9.greet());
  hello9.setName('Carol');
  console.log('Changed name:', hello9.greet());
  console.log(`Total greetings: ${hello9.getGreetingCount()}`);
  
  // Example 10: Reset functionality
  console.log('\n🔄 Example 10: Reset Functionality');
  console.log('=' .repeat(60));
  const hello10 = new HelloBitcoin('Dave');
  hello10.greet();
  hello10.greet();
  hello10.greet();
  console.log(`Before reset - Count: ${hello10.getGreetingCount()}, History length: ${hello10.getHistory().length}`);
  hello10.reset();
  console.log(`After reset - Count: ${hello10.getGreetingCount()}, History length: ${hello10.getHistory().length}`);
  hello10.greet();
  console.log(`After new greeting - Count: ${hello10.getGreetingCount()}`);
  
  // Example 11: Practical usage scenario
  console.log('\n🌟 Example 11: Practical Usage Scenario');
  console.log('=' .repeat(60));
  console.log('Creating a Bitcoin greeting bot...\n');
  
  const greetingBot = new HelloBitcoin('Bitcoin Greeting Bot');
  
  // Simulate greeting different users
  const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
  users.forEach(user => {
    greetingBot.setName(`Bitcoin Bot for ${user}`);
    console.log(greetingBot.greetWithEmoji());
  });
  
  console.log(`\nBot has sent ${greetingBot.getGreetingCount()} greetings!`);
  
  // Example 12: Different greeting styles
  console.log('\n🎨 Example 12: Different Greeting Styles');
  console.log('=' .repeat(60));
  const hello12 = new HelloBitcoin('Hodler');
  console.log('Simple:', hello12.greet());
  console.log('Formal:', hello12.formalGreet());
  console.log('Custom:', hello12.greetWithMessage('To the moon! 🚀'));
  console.log('Emoji:', hello12.greetWithEmoji());
  
  // Final summary
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Example completed successfully!');
  console.log('=' .repeat(60));
  console.log('\n💡 Usage Tips:');
  console.log('  1. Create instance: const hello = new HelloBitcoin("YourName")');
  console.log('  2. Simple greeting: hello.greet()');
  console.log('  3. Custom message: hello.greetWithMessage("Your message")');
  console.log('  4. Formal greeting: hello.formalGreet()');
  console.log('  5. Fun emoji greeting: hello.greetWithEmoji()');
  console.log('  6. Get Bitcoin info: hello.getBitcoinInfo()');
  console.log('  7. View history: hello.formatHistory()');
  console.log('  8. Change name: hello.setName("NewName")');
  console.log('  9. Reset counter: hello.reset()');
  console.log('\n📚 For more information, see the module documentation.');
  console.log('🌏 Big World Bigger Ideas - Empowering crypto clarity!');
}

// Run the example
runExample();
