// Quick validation test to ensure square highlighting works
// This can be run in the browser console

function testSquareHighlighting() {
  console.log('Testing Corporate Bingo square highlighting...');
  
  // Wait for the app to load
  setTimeout(() => {
    // Find all bingo squares
    const squares = document.querySelectorAll('.bingo-square');
    console.log(`Found ${squares.length} bingo squares`);
    
    if (squares.length === 0) {
      console.error('❌ No bingo squares found - game might not be loaded');
      return;
    }
    
    // Test clicking a non-free square
    const nonFreeSquares = Array.from(squares).filter(square => 
      !square.classList.contains('free')
    );
    
    if (nonFreeSquares.length === 0) {
      console.error('❌ No clickable squares found');
      return;
    }
    
    const testSquare = nonFreeSquares[0];
    console.log('Testing square:', testSquare.textContent?.trim());
    
    // Check initial state
    const initiallyMarked = testSquare.classList.contains('marked');
    console.log('Initially marked:', initiallyMarked);
    
    // Click the square
    testSquare.click();
    
    // Check if state changed after a brief delay
    setTimeout(() => {
      const nowMarked = testSquare.classList.contains('marked');
      console.log('Now marked:', nowMarked);
      
      if (initiallyMarked !== nowMarked) {
        console.log('✅ Square highlighting is working correctly!');
        
        // Look for visual feedback (checkmark)
        const checkmark = testSquare.querySelector('svg');
        if (checkmark && nowMarked) {
          console.log('✅ Visual checkmark is displayed');
        } else if (!nowMarked) {
          console.log('✅ Visual checkmark correctly hidden');
        }
        
      } else {
        console.error('❌ Square highlighting not working - state did not change');
      }
    }, 100);
    
  }, 1000);
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.testSquareHighlighting = testSquareHighlighting;
  console.log('Test function available as window.testSquareHighlighting()');
}

export default testSquareHighlighting;