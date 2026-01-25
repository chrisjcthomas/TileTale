const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock data
const mockConfig = {
  nodeEnv: 'production',
  instagram: {
    oauthUrl: 'http://oauth',
    appId: 'test_app_id',
    redirectUri: 'test_redirect_uri'
  }
};

// Mock map
const mocks = {
  '../config': mockConfig,
  '../controllers/instagramController': {},
  '../middleware/auth': {},
  '../middleware/cache': {}
};

// Intercept require
Module.prototype.require = function(request) {
  // Check if we have a mock for this request
  if (mocks[request]) {
    return mocks[request];
  }

  // Also handle express specially if needed, but 'express' is usually installed
  if (request === 'express') {
    return {
      Router: () => ({
        get: (path, handler) => {
          if (!global.routes) global.routes = {};
          global.routes['GET ' + path] = handler;
        },
        post: (path, handler) => {
          if (!global.routes) global.routes = {};
          global.routes['POST ' + path] = handler;
        }
      })
    };
  }

  return originalRequire.apply(this, arguments);
};

console.log('Starting unit test for /instagram route...');

try {
  // Load the route module (which registers routes into our global.routes mock)
  // We need to resolve the path relative to THIS file to find the target file
  require('../routes/auth.js');

  // Verify route registration
  const handler = global.routes['GET /instagram'];
  if (!handler) {
    throw new Error('Handler for GET /instagram not registered');
  }

  // Mock Request and Response
  const req = {};
  let cookieCalled = false;
  let redirectCalled = false;

  const res = {
    cookie: (name, value, options) => {
      cookieCalled = true;
      console.log(`res.cookie called with name=${name}`);

      // Verify Hex String (32 bytes = 64 chars)
      if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
        throw new Error(`State value '${value}' is not a valid 64-char hex string`);
      }
      console.log('✅ State is a valid 64-char hex string');

      // Verify Options
      if (options.httpOnly !== true) throw new Error('httpOnly should be true');
      if (options.sameSite !== 'lax') throw new Error('sameSite should be lax');
      if (options.secure !== true) throw new Error('secure should be true (since we mocked production)');
      console.log('✅ Cookie options are correct (including secure: true)');
    },
    redirect: (url) => {
      redirectCalled = true;
      console.log(`res.redirect called with url=${url}`);
      if (!url.includes('state=')) {
        throw new Error('Redirect URL must include state parameter');
      }
    }
  };

  // Run the handler
  handler(req, res);

  if (!cookieCalled) throw new Error('res.cookie was not called');
  if (!redirectCalled) throw new Error('res.redirect was not called');

  console.log('✅ Unit test passed successfully');

} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
} finally {
  // Restore require
  Module.prototype.require = originalRequire;
}
