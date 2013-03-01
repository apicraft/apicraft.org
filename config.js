function Config() {
  this.port = process.env.PORT || 3000;
  this.proxyUrl = process.env.PROXY_URL || 'http://localhost:3001';
}

module.exports = new Config();
