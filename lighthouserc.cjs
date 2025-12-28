module.exports = {
  ci: {
    collect: {
      staticDistDir: "./packages/frontend/build",
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}