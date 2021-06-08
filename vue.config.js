module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  publicPath:
    process.env.NODE_ENV === 'production' ? '/ao-loot-logger-viewer' : '/',
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Loot Logger Viewer - Albion Online'
    }
  }
}
