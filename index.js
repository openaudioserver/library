
module.exports = {
  scan: async (libraryPathString) => {
    const indexer = require('./indexer.js')
    return indexer.scan(libraryPathString)
  },
  load: async (libraryPathString) => {
    const library = require('./library.js')
    return library.load(libraryPathString)
  }
}
