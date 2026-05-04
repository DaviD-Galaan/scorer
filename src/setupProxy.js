const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🚀 setupProxy.js loaded!');

  // Proxy pour l'API
  app.use(
    '/api.1.0',
    createProxyMiddleware({
      target: 'https://dev.tttm.co.il',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        console.log('🌐 Proxying API request:', req.method, req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ API response:', proxyRes.statusCode, req.url);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
      }
    })
  );

  // Proxy pour les images
  app.use(
    '/matchsPict',
    createProxyMiddleware({
      target: 'https://dev.tttm.co.il',
      changeOrigin: true,
      secure: false
    })
  );

  // Proxy pour les assets
  app.use(
    '/img',
    createProxyMiddleware({
      target: 'https://dev.tttm.co.il',
      changeOrigin: true,
      secure: false
    })
  );
};
