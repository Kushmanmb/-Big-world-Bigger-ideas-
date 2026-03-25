/**
 * BTCK (BtcTurk) API Module Example
 * Demonstrates how to use the BtcTurk public market data fetcher
 */

const BTCKFetcher = require('./btck.js');

async function runExample() {
  console.log('🌏 Big World Bigger Ideas - BTCK (BtcTurk) API Example\n');
  console.log('='.repeat(60));

  const fetcher = new BTCKFetcher();
  console.log('\n📦 BTCKFetcher instance created');

  // Example 1: Fetch all tickers
  console.log('\n' + '='.repeat(60));
  console.log('📈 Example 1: Fetching all tickers...');
  console.log('='.repeat(60));
  try {
    const tickers = await fetcher.getTickers();
    console.log('\n✓ Tickers fetched successfully!');
    console.log('\nFormatted Output:');
    console.log(fetcher.formatTickers(tickers));
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
    console.log('The module is ready to use in production with network connectivity.\n');
  }

  // Example 2: Fetch a specific ticker
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Example 2: Fetching BTCTRY ticker...');
  console.log('='.repeat(60));
  try {
    const btcTicker = await fetcher.getTickers('BTCTRY');
    console.log('\n✓ BTCTRY ticker fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(btcTicker, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 3: Fetch exchange info
  console.log('\n' + '='.repeat(60));
  console.log('🏦 Example 3: Fetching exchange info...');
  console.log('='.repeat(60));
  try {
    const info = await fetcher.getExchangeInfo();
    console.log('\n✓ Exchange info fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(info, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 4: Fetch order book
  console.log('\n' + '='.repeat(60));
  console.log('📒 Example 4: Fetching order book for BTCTRY...');
  console.log('='.repeat(60));
  try {
    const orderBook = await fetcher.getOrderBook('BTCTRY');
    console.log('\n✓ Order book fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(orderBook, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 5: Fetch recent trades
  console.log('\n' + '='.repeat(60));
  console.log('💱 Example 5: Fetching recent trades for BTCTRY...');
  console.log('='.repeat(60));
  try {
    const trades = await fetcher.getTrades('BTCTRY', 10);
    console.log('\n✓ Trades fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(trades, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 6: Fetch OHLC data
  console.log('\n' + '='.repeat(60));
  console.log('🕯️  Example 6: Fetching OHLC data for BTCTRY...');
  console.log('='.repeat(60));
  try {
    const ohlc = await fetcher.getOHLC('BTCTRY');
    console.log('\n✓ OHLC data fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(ohlc, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 7: Fetch kline history
  console.log('\n' + '='.repeat(60));
  console.log('📊 Example 7: Fetching kline history for BTCTRY (1h candles, last 24h)...');
  console.log('='.repeat(60));
  try {
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 86400;
    const klines = await fetcher.getKlines('BTCTRY', 60, yesterday, now);
    console.log('\n✓ Kline history fetched successfully!');
    console.log('\nSample data structure:');
    console.log(JSON.stringify(klines, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 8: fetchAll — get all public data at once
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Example 8: fetchAll — fetching all public endpoints at once...');
  console.log('='.repeat(60));
  try {
    const all = await fetcher.fetchAll();
    console.log('\n✓ All public data fetched successfully!');
    console.log('\nKeys returned:', Object.keys(all).join(', '));
  } catch (error) {
    console.log(`\n⚠️  Note: ${error.message}`);
    console.log('This is expected in environments without internet access.');
  }

  // Example 9: Demonstrate formatting with mock data
  console.log('\n' + '='.repeat(60));
  console.log('🎨 Example 9: Formatting mock ticker data...');
  console.log('='.repeat(60));

  const mockTickers = [
    { pairNumerator: 'BTC', pairDenominator: 'TRY', last: 1000000, bid: 999000, ask: 1001000, volume: 500, high: 1050000, low: 980000 },
    { pairNumerator: 'ETH', pairDenominator: 'TRY', last: 50000, bid: 49800, ask: 50200, volume: 1000, high: 52000, low: 48000 },
    { pairNumerator: 'XRP', pairDenominator: 'TRY', last: 25, bid: 24, ask: 26, volume: 200000, high: 28, low: 22 }
  ];
  console.log('\nMock ticker formatting:');
  console.log(fetcher.formatTickers(mockTickers));

  // Example 10: Cache statistics
  console.log('\n' + '='.repeat(60));
  console.log('💾 Example 10: Cache statistics...');
  console.log('='.repeat(60));

  const cacheStats = fetcher.getCacheStats();
  console.log('\nCache Statistics:');
  console.log(`  Size:    ${cacheStats.size} entries`);
  console.log(`  Timeout: ${cacheStats.timeout / 1000} seconds`);
  console.log(`  Keys:    ${cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : 'None'}`);

  // Clear cache
  fetcher.clearCache();
  console.log('\n✓ Cache cleared');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Example completed successfully!');
  console.log('='.repeat(60));
  console.log('\n💡 Usage Tips:');
  console.log('  1. Create a fetcher:          const fetcher = new BTCKFetcher()');
  console.log('  2. Fetch all tickers:          await fetcher.getTickers()');
  console.log('  3. Fetch single ticker:        await fetcher.getTickers("BTCTRY")');
  console.log('  4. Fetch exchange info:        await fetcher.getExchangeInfo()');
  console.log('  5. Fetch order book:           await fetcher.getOrderBook("BTCTRY")');
  console.log('  6. Fetch recent trades:        await fetcher.getTrades("BTCTRY")');
  console.log('  7. Fetch OHLC data:            await fetcher.getOHLC("BTCTRY")');
  console.log('  8. Fetch kline history:        await fetcher.getKlines("BTCTRY", 60, from, to)');
  console.log('  9. Fetch all at once:          await fetcher.fetchAll()');
  console.log(' 10. Format output:             fetcher.formatTickers(data)');
  console.log('\n📚 For more information, see src/BTCK.md');
}

// Run the example
runExample().catch(error => {
  console.error('\n❌ Example failed:', error);
  process.exit(1);
});
