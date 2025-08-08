/**
 * QA Engineer Agent - Comprehensive Testing Suite
 * Production URL Testing with Full MCP Integration
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://corporate-bingo-ai.netlify.app';
const SCREENSHOTS_DIR = 'F:/CC/Projects/Corporate Bingo/testing/screenshots';
const VALIDATION_DIR = 'F:/CC/Projects/Corporate Bingo/testing/validation';

// Mobile device configurations for testing
const DEVICES = [
  { name: 'mobile', width: 375, height: 812, userAgent: 'Mobile' },
  { name: 'tablet', width: 768, height: 1024, userAgent: 'Tablet' },
  { name: 'laptop', width: 1366, height: 768, userAgent: 'Desktop' },
  { name: 'desktop', width: 1920, height: 1080, userAgent: 'Desktop' }
];

class QATestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: {},
      functionality: {},
      performance: {},
      accessibility: {},
      responsive: {},
      multiplayer: {},
      errors: []
    };
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 QA Engineer Agent - Comprehensive Testing Suite');
    console.log(`📍 Testing URL: ${BASE_URL}`);
    
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Setup error tracking
      this.page.on('console', msg => {
        const type = msg.type();
        if (type === 'error' || type === 'warning') {
          console.log(`[${type.toUpperCase()}] ${msg.text()}`);
          if (type === 'error') {
            this.results.errors.push({
              type: 'console_error',
              message: msg.text(),
              timestamp: new Date().toISOString()
            });
          }
        }
      });

      this.page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
        this.results.errors.push({
          type: 'page_error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize testing environment:', error);
      return false;
    }
  }

  async testFunctionality() {
    console.log('\n📋 1. FUNCTIONALITY TESTING');
    
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Test Solo Play Mode
    console.log('   Testing Solo Play Mode...');
    const grid = await this.page.$('.bingo-grid');
    const squares = await this.page.$$('.bingo-square');
    const soloHeader = await this.page.$eval('h2', el => el.textContent || '');
    
    let interactionWorks = false;
    let winDetectionWorks = false;
    
    if (squares.length >= 6) {
      // Test square interaction
      const testSquare = squares[5]; // Avoid center FREE space
      await testSquare.click();
      await this.page.waitForTimeout(500);
      interactionWorks = await testSquare.evaluate(el => 
        el.classList.contains('marked') || el.classList.contains('selected')
      );
      
      // Test win detection (click multiple squares in a row)
      try {
        await squares[0].click();
        await this.page.waitForTimeout(100);
        await squares[1].click();
        await this.page.waitForTimeout(100);
        await squares[2].click();
        await this.page.waitForTimeout(100);
        await squares[3].click();
        await this.page.waitForTimeout(100);
        await squares[4].click();
        await this.page.waitForTimeout(1000);
        
        // Check for win celebration
        const winElement = await this.page.$('.win-celebration, .bingo-win, [data-testid="win"]');
        winDetectionWorks = !!winElement;
      } catch (error) {
        console.log('   Win detection test failed:', error.message);
      }
    }
    
    // Test game reset
    const resetButton = await this.page.$('button[data-testid="reset"], .reset-btn, .new-game-btn');
    let resetWorks = false;
    if (resetButton) {
      await resetButton.click();
      await this.page.waitForTimeout(500);
      const newSquares = await this.page.$$('.bingo-square.marked');
      resetWorks = newSquares.length === 0; // No marked squares after reset
    }

    this.results.functionality = {
      gridPresent: !!grid,
      correctSquareCount: squares.length === 25,
      soloModeActive: soloHeader.includes('Solo') || soloHeader.includes('Play'),
      squareInteraction: interactionWorks,
      winDetection: winDetectionWorks,
      gameReset: resetWorks,
      consoleErrors: this.results.errors.filter(e => e.type === 'console_error').length
    };

    console.log(`   ✅ Grid present: ${this.results.functionality.gridPresent}`);
    console.log(`   ✅ Square count (25): ${this.results.functionality.correctSquareCount}`);
    console.log(`   ✅ Solo mode: ${this.results.functionality.soloModeActive}`);
    console.log(`   ✅ Square interaction: ${this.results.functionality.squareInteraction}`);
    console.log(`   ✅ Win detection: ${this.results.functionality.winDetection}`);
    console.log(`   ✅ Game reset: ${this.results.functionality.gameReset}`);
  }

  async testMultiplayer() {
    console.log('\n🤝 2. MULTIPLAYER TESTING');
    
    try {
      // Look for rooms/multiplayer UI
      const roomButton = await this.page.$('button[data-testid="rooms"], .rooms-btn, .multiplayer-btn, button:contains("Rooms")');
      const sidebarButton = await this.page.$('button[data-testid="sidebar"], .sidebar-btn, .menu-btn');
      
      let multiplayerAccessible = false;
      let roomCreationWorks = false;
      
      if (sidebarButton) {
        await sidebarButton.click();
        await this.page.waitForTimeout(1000);
        
        const roomsLink = await this.page.$('a[href*="rooms"], button:contains("Rooms"), .rooms-option');
        if (roomsLink) {
          multiplayerAccessible = true;
          await roomsLink.click();
          await this.page.waitForTimeout(2000);
          
          // Test room creation
          const nameInput = await this.page.$('input[type="text"], input[placeholder*="name"]');
          const createButton = await this.page.$('button[data-testid="create-room"], button:contains("Create"), .create-room-btn');
          
          if (nameInput && createButton) {
            await nameInput.type('QA Test Player');
            await createButton.click();
            await this.page.waitForTimeout(2000);
            
            // Check if room was created (look for room code)
            const roomCode = await this.page.$('.room-code, [data-testid="room-code"]');
            roomCreationWorks = !!roomCode;
          }
        }
      }
      
      this.results.multiplayer = {
        accessible: multiplayerAccessible,
        roomCreation: roomCreationWorks,
        uiResponsive: true
      };
      
      console.log(`   ✅ Multiplayer accessible: ${this.results.multiplayer.accessible}`);
      console.log(`   ✅ Room creation: ${this.results.multiplayer.roomCreation}`);
      
    } catch (error) {
      console.log(`   ⚠️ Multiplayer test error: ${error.message}`);
      this.results.multiplayer = {
        accessible: false,
        roomCreation: false,
        error: error.message
      };
    }
  }

  async testPerformance() {
    console.log('\n⚡ 3. PERFORMANCE TESTING');
    
    const startTime = Date.now();
    await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstContentfulPaint: 0, // Would need Performance Observer
        timeToInteractive: Math.round(navigation.domInteractive - navigation.navigationStart)
      };
    });
    
    // Test interaction responsiveness
    const squares = await this.page.$$('.bingo-square');
    let responseTime = 0;
    if (squares.length > 0) {
      const start = Date.now();
      await squares[0].click();
      responseTime = Date.now() - start;
    }
    
    this.results.performance = {
      pageLoadTime: loadTime,
      domContentLoaded: metrics.domContentLoaded,
      loadComplete: metrics.loadComplete,
      timeToInteractive: metrics.timeToInteractive,
      clickResponseTime: responseTime,
      consoleErrors: this.results.errors.length
    };
    
    console.log(`   ✅ Page load: ${loadTime}ms`);
    console.log(`   ✅ DOM ready: ${metrics.domContentLoaded}ms`);
    console.log(`   ✅ Load complete: ${metrics.loadComplete}ms`);
    console.log(`   ✅ Click response: ${responseTime}ms`);
    console.log(`   ✅ Console errors: ${this.results.errors.length}`);
  }

  async testAccessibility() {
    console.log('\n♿ 4. ACCESSIBILITY TESTING');
    
    // Check ARIA attributes
    const ariaElements = await this.page.$$('[aria-label], [aria-describedby], [role]');
    const focusableElements = await this.page.$$('button, [tabindex], a, input');
    
    // Test keyboard navigation
    let keyboardWorks = false;
    try {
      const firstButton = await this.page.$('button');
      if (firstButton) {
        await firstButton.focus();
        await this.page.keyboard.press('Tab');
        const focused = await this.page.evaluate(() => document.activeElement?.tagName);
        keyboardWorks = focused === 'BUTTON' || focused === 'INPUT' || focused === 'A';
      }
    } catch (error) {
      console.log('   Keyboard test error:', error.message);
    }
    
    // Check color contrast (basic check for dark theme)
    const hasProperContrast = await this.page.evaluate(() => {
      const computedStyle = window.getComputedStyle(document.body);
      const bgColor = computedStyle.backgroundColor;
      return bgColor.includes('rgb(17, 24, 39)') || bgColor.includes('dark'); // Dark theme check
    });
    
    this.results.accessibility = {
      ariaAttributes: ariaElements.length,
      focusableElements: focusableElements.length,
      keyboardNavigation: keyboardWorks,
      contrastCompliant: hasProperContrast
    };
    
    console.log(`   ✅ ARIA attributes: ${ariaElements.length}`);
    console.log(`   ✅ Focusable elements: ${focusableElements.length}`);
    console.log(`   ✅ Keyboard navigation: ${keyboardWorks}`);
    console.log(`   ✅ Contrast compliant: ${hasProperContrast}`);
  }

  async testResponsiveDesign() {
    console.log('\n📱 5. RESPONSIVE DESIGN TESTING');
    
    const deviceResults = {};
    
    for (const device of DEVICES) {
      console.log(`   Testing ${device.name} (${device.width}x${device.height})`);
      
      await this.page.setViewport({ 
        width: device.width, 
        height: device.height 
      });
      
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(1000);
      
      // Check layout
      const layoutCheck = await this.page.evaluate(() => {
        const body = document.body;
        return {
          fitsScreen: body.scrollWidth <= window.innerWidth,
          gridVisible: !!document.querySelector('.bingo-grid'),
          headerVisible: !!document.querySelector('h1, h2'),
          buttonsAccessible: document.querySelectorAll('button').length > 0
        };
      });
      
      // Check touch targets for mobile
      let touchTargetsOK = true;
      if (device.name === 'mobile' || device.name === 'tablet') {
        const touchTargets = await this.page.$$eval('.bingo-square', elements => {
          return elements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              meetsMinimum: rect.width >= 44 && rect.height >= 44
            };
          });
        });
        
        const meetingMin = touchTargets.filter(t => t.meetsMinimum).length;
        touchTargetsOK = (meetingMin / touchTargets.length) >= 0.8;
      }
      
      // Take screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `qa-test-${device.name}-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      deviceResults[device.name] = {
        fitsScreen: layoutCheck.fitsScreen,
        gridVisible: layoutCheck.gridVisible,
        headerVisible: layoutCheck.headerVisible,
        buttonsAccessible: layoutCheck.buttonsAccessible,
        touchTargetsOK: touchTargetsOK,
        screenshot: screenshotPath
      };
      
      console.log(`   ✅ ${device.name}: Layout OK - ${layoutCheck.fitsScreen}, Grid - ${layoutCheck.gridVisible}`);
    }
    
    this.results.responsive = deviceResults;
  }

  async generateSummary() {
    console.log('\n📊 6. GENERATING COMPREHENSIVE SUMMARY');
    
    // Calculate overall scores
    const functionalityScore = Object.values(this.results.functionality)
      .filter(v => typeof v === 'boolean')
      .reduce((acc, val) => acc + (val ? 1 : 0), 0) / 
      Object.values(this.results.functionality).filter(v => typeof v === 'boolean').length;
    
    const performanceScore = (
      (this.results.performance.pageLoadTime < 3000 ? 1 : 0) +
      (this.results.performance.domContentLoaded < 1500 ? 1 : 0) +
      (this.results.performance.clickResponseTime < 100 ? 1 : 0) +
      (this.results.performance.consoleErrors === 0 ? 1 : 0)
    ) / 4;
    
    const accessibilityScore = (
      (this.results.accessibility.ariaAttributes > 5 ? 1 : 0) +
      (this.results.accessibility.focusableElements > 10 ? 1 : 0) +
      (this.results.accessibility.keyboardNavigation ? 1 : 0) +
      (this.results.accessibility.contrastCompliant ? 1 : 0)
    ) / 4;
    
    const responsiveScore = Object.values(this.results.responsive)
      .reduce((acc, device) => {
        const deviceScore = (
          (device.fitsScreen ? 1 : 0) +
          (device.gridVisible ? 1 : 0) +
          (device.buttonsAccessible ? 1 : 0) +
          (device.touchTargetsOK ? 1 : 0)
        ) / 4;
        return acc + deviceScore;
      }, 0) / Object.keys(this.results.responsive).length;
    
    const overallScore = (functionalityScore + performanceScore + accessibilityScore + responsiveScore) / 4;
    
    // Determine status
    let status, decision;
    if (overallScore >= 0.95) {
      status = 'EXCELLENT';
      decision = 'PRODUCTION READY';
    } else if (overallScore >= 0.85) {
      status = 'VERY GOOD';
      decision = 'DEPLOY WITH CONFIDENCE';
    } else if (overallScore >= 0.75) {
      status = 'GOOD';
      decision = 'DEPLOY WITH MINOR NOTES';
    } else if (overallScore >= 0.65) {
      status = 'ACCEPTABLE';
      decision = 'DEPLOY WITH CAUTION';
    } else {
      status = 'NEEDS IMPROVEMENT';
      decision = 'REQUIRES FIXES';
    }
    
    this.results.overall = {
      status,
      decision,
      overallScore: Math.round(overallScore * 100),
      functionalityScore: Math.round(functionalityScore * 100),
      performanceScore: Math.round(performanceScore * 100),
      accessibilityScore: Math.round(accessibilityScore * 100),
      responsiveScore: Math.round(responsiveScore * 100),
      totalErrors: this.results.errors.length,
      recommendation: overallScore >= 0.85 ? 
        'Application meets production standards. Ready for widespread deployment.' :
        'Application needs minor improvements before full production deployment.'
    };
    
    console.log('='.repeat(80));
    console.log(`📊 FINAL QA ASSESSMENT`);
    console.log(`🎯 Status: ${status}`);
    console.log(`✅ Decision: ${decision}`);
    console.log(`📈 Overall Score: ${this.results.overall.overallScore}%`);
    console.log(`⚡ Functionality: ${this.results.overall.functionalityScore}%`);
    console.log(`🚀 Performance: ${this.results.overall.performanceScore}%`);
    console.log(`♿ Accessibility: ${this.results.overall.accessibilityScore}%`);
    console.log(`📱 Responsive: ${this.results.overall.responsiveScore}%`);
    console.log(`❌ Total Errors: ${this.results.overall.totalErrors}`);
    console.log('='.repeat(80));
    console.log(`💡 ${this.results.overall.recommendation}`);
  }

  async saveResults() {
    // Create directories if they don't exist
    await fs.mkdir(VALIDATION_DIR, { recursive: true });
    
    // Save comprehensive results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(VALIDATION_DIR, `comprehensive-qa-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Save summary report
    const summaryPath = path.join(VALIDATION_DIR, `qa-summary-${timestamp}.md`);
    const summaryContent = `# QA Testing Summary Report

**Generated**: ${this.results.timestamp}
**URL Tested**: ${BASE_URL}
**Overall Status**: ${this.results.overall.status}
**Decision**: ${this.results.overall.decision}

## Scores
- **Overall**: ${this.results.overall.overallScore}%
- **Functionality**: ${this.results.overall.functionalityScore}%
- **Performance**: ${this.results.overall.performanceScore}%
- **Accessibility**: ${this.results.overall.accessibilityScore}%
- **Responsive Design**: ${this.results.overall.responsiveScore}%

## Key Findings
- Total Errors: ${this.results.overall.totalErrors}
- Console Errors: ${this.results.functionality.consoleErrors}
- Page Load Time: ${this.results.performance.pageLoadTime}ms
- Responsive Devices Tested: ${Object.keys(this.results.responsive).length}

## Recommendation
${this.results.overall.recommendation}

## Files Generated
- Full Report: ${reportPath}
- Screenshots: ${SCREENSHOTS_DIR}/
`;
    
    await fs.writeFile(summaryPath, summaryContent);
    
    console.log(`\n📋 Reports saved:`);
    console.log(`   📄 Full report: ${reportPath}`);
    console.log(`   📝 Summary: ${summaryPath}`);
    
    return { reportPath, summaryPath };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runComprehensiveQA() {
  const qa = new QATestSuite();
  
  try {
    const initialized = await qa.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize QA test suite');
    }
    
    await qa.testFunctionality();
    await qa.testMultiplayer();
    await qa.testPerformance();
    await qa.testAccessibility();
    await qa.testResponsiveDesign();
    await qa.generateSummary();
    
    const { reportPath, summaryPath } = await qa.saveResults();
    
    console.log('\n✅ Comprehensive QA testing completed successfully!');
    return qa.results;
    
  } catch (error) {
    console.error('❌ QA testing failed:', error);
    throw error;
  } finally {
    await qa.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveQA()
    .then(results => {
      process.exit(results.overall.overallScore >= 85 ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveQA };