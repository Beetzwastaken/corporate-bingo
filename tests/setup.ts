// Test Setup Configuration
// Global test setup for dashboard testing with MCP integration

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver (commonly needed for responsive components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver (for lazy loading components)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia (for responsive design testing)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Window.crypto for secure random generation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: any) => arr.fill(Math.floor(Math.random() * 256)),
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})

// Mock performance API for performance testing
global.performance = {
  ...global.performance,
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now())
}

// Mock local storage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock session storage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock WebSocket for real-time testing
const mockWebSocket = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  readyState: 1,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
}

global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket)

// Corporate Humor Validation Setup
export const CORPORATE_APPROPRIATENESS_STANDARDS = {
  EXECUTIVE_THRESHOLD: 96, // Minimum appropriateness score for C-suite content
  MANAGEMENT_THRESHOLD: 88, // Minimum for management level
  TEAM_THRESHOLD: 80, // Minimum for team level
  
  INAPPROPRIATE_TERMS: [
    'damn', 'hell', 'crap', 'stupid', 'idiots', 'sucks', 
    'bullshit', 'wtf', 'omg', 'lmao', 'fml'
  ],
  
  PROFESSIONAL_TERMS: [
    'synergy', 'leverage', 'optimize', 'streamline', 'efficiency',
    'alignment', 'strategic', 'implementation', 'collaboration',
    'innovation', 'excellence', 'performance', 'analytics'
  ],
  
  HUMOR_CATEGORIES: {
    SUBTLE_IRONY: 'Gentle corporate observations',
    MEETING_PAIN: 'Relatable meeting experiences', 
    BUZZWORD_COMEDY: 'Corporate terminology humor',
    PROFESSIONAL_SARCASM: 'Workplace situational comedy'
  }
}

// Performance Benchmarking Setup
export const PERFORMANCE_BENCHMARKS = {
  DASHBOARD_LOAD_TIME: 3000, // 3 seconds max on 3G
  API_RESPONSE_TIME: 200, // 200ms max for analytics endpoints
  WEBSOCKET_LATENCY: 100, // 100ms max for real-time updates
  COMPONENT_RENDER_TIME: 50, // 50ms max for component rendering
  MEMORY_USAGE_LIMIT: 50 * 1024 * 1024, // 50MB max memory usage
  
  MOBILE_VIEWPORTS: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 360, height: 740, name: 'Samsung Galaxy S10' }
  ],
  
  DESKTOP_VIEWPORTS: [
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 1366, height: 768, name: 'Standard Laptop' },
    { width: 1920, height: 1080, name: 'Full HD Desktop' }
  ]
}

// MCP Server Integration Testing Setup
export const MCP_TEST_CONFIG = {
  EXCEL_VBA_AVAILABLE: true,
  OPENCV_AVAILABLE: true,
  SVGMAKER_AVAILABLE: true,
  
  MOCK_EXCEL_DATA: {
    contentEffectiveness: [
      { contentId: 'test-1', appropriatenessScore: 95, executiveApproval: 92 },
      { contentId: 'test-2', appropriatenessScore: 88, executiveApproval: 85 }
    ],
    
    buzzwordMetrics: [
      { buzzword: 'synergy', effectiveness: 94, usage: 2847 },
      { buzzword: 'deep dive', effectiveness: 91, usage: 2156 }
    ]
  },
  
  MOCK_OPENCV_ANALYSIS: {
    qualityScore: 95,
    textRegions: [
      { x: 10, y: 10, width: 200, height: 50, confidence: 0.95 }
    ],
    suggestions: ['Excellent text contrast', 'Good layout spacing']
  }
}

// Testing utilities
export const testUtils = {
  // Corporate humor appropriateness validator
  validateCorporateAppropriatenesss: (content: string, threshold = 96): boolean => {
    const inappropriate = CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS
      .some(term => content.toLowerCase().includes(term))
    
    if (inappropriate) return false
    
    // Check for professional terminology
    const professionalScore = CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS
      .filter(term => content.toLowerCase().includes(term)).length
    
    return (professionalScore / CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS.length * 100) >= threshold
  },
  
  // Performance measurement helper
  measurePerformance: async (operation: () => Promise<any> | any): Promise<number> => {
    const start = performance.now()
    await operation()
    const end = performance.now()
    return end - start
  },
  
  // Viewport simulator for responsive testing
  setViewport: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height })
    window.dispatchEvent(new Event('resize'))
  },
  
  // WebSocket message simulator
  simulateWebSocketMessage: (ws: any, message: any) => {
    if (ws.onmessage) {
      ws.onmessage({ data: JSON.stringify(message) })
    }
  },
  
  // API response simulator
  mockApiResponse: (data: any, delay = 0) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }))
      }, delay)
    })
  }
}

// Console warning suppression for known test warnings
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  // Suppress known React warnings in tests
  if (args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

// Global test cleanup
afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks()
  
  // Clear local storage
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  
  // Reset DOM
  document.body.innerHTML = ''
  
  // Reset viewport
  testUtils.setViewport(1024, 768)
})

export default testUtils