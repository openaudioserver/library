
module.exports = {
  index: async (libraryPathString) => {
    const indexer = require('./indexer.js')
    return indexer.start(libraryPathString)
  },
  load: async (libraryPathString) => {
    const library = require('./library.js')
    return library.load(libraryPathString)
  }
}
