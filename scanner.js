const fs = require('fs')
const path = require('path')
const util = require('util')
const zlib = require('zlib')
const gzipAsync = util.promisify(zlib.gzip)
const unzipAsync = util.promisify(zlib.unzip)
const statAsync = util.promisify(fs.stat)
const readDirAsync = util.promisify(fs.readdir)
const writeFileAsync = util.promisify(fs.writeFile)
const readFileAsync = util.promisify(fs.readFile)

const albumIndexer = require('./src/albums.js')
const genreIndexer = require('./src/genres.js')
const composerIndexer = require('./src/composers.js')
const artistIndexer = require('./src/artists.js')
const mediaIndexer = require('./src/media.js')

module.exports = {
  scan
}

if (process.argv[1] === __filename) {
  commandLineStart()
}

async function existsAsync (itemPath) {
  try {
    await statAsync(itemPath)
    return true
  } catch (error) {
    return false
  }
}

async function commandLineStart () {
  const libraryPaths = []
  let index = 2
  while (true) {
    const folderPath = process.argv[index]
    const exists = await existsAsync(folderPath)
    if (!exists) {
      break
    }
    libraryPaths.push(folderPath)
    index++
  }
  await scan(libraryPaths, true)
  console.log('[indexer]', 'finished scanning')
  return process.exit(0)
}

async function scan (libraryPaths, readExistingFiles) {
  const startTime = process.hrtime()
  if (libraryPaths.length > 1) {
    console.log('[indexer]', 'scanning multiple paths')
    for (const libraryPath of libraryPaths) {
      await scanLibrary(libraryPath, readExistingFiles)
    }
  } else {
    console.log('[indexer]', 'scanning single path')
    await scanLibrary(libraryPaths[0], readExistingFiles)
  }
  const stopTime = process.hrtime(startTime)
  console.info('[indexer', 'total scan time (hr): %ds %dms', stopTime[0], stopTime[1] / 1000000)
}

async function scanLibrary (libraryPath, readExistingFiles) {
  const startTime = process.hrtime()
  console.log('[indexer]', 'scanning library', libraryPath, 'read existing again', readExistingFiles)
  const dataFileName = process.env.GZIP ? 'library.json.gzip' : 'library.json'
  const dataPath = path.join(libraryPath, dataFileName)
  const data = await scanLibraryRoot(libraryPath, dataPath, readExistingFiles)
  console.log('[indexer]', 'writing data')
  if (process.env.GZIP) {
    console.log('[indexer]', 'compressing data')
    const compressedData = await gzipAsync(JSON.stringify(data))
    console.log('[indexer]', 'writing compressed data', compressedData.length)
    await writeFileAsync(dataPath, compressedData)
  } else {
    const buffer = Buffer.from(JSON.stringify(data, null, '  '))
    console.log('[indexer]', 'writing uncompressed data', buffer.length)
    await writeFileAsync(dataPath, buffer)
  }
  const stopTime = process.hrtime(startTime)
  console.info('[indexer', 'library scan time (hr): %ds %dms', stopTime[0], stopTime[1] / 1000000)
}

async function scanLibraryRoot (libraryPath, dataPath, readExistingFiles) {
  console.log('[indexer]', 'scanning library root', libraryPath)
  let existingData
  if (readExistingFiles) {
    const exists = await existsAsync(dataPath)
    if (exists) {
      let rawData = await readFileAsync(dataPath)
      if (process.env.GZIP) {
        rawData = await unzipAsync(rawData)
      }
      existingData = JSON.parse(rawData)
    }
  }
  const library = {
    media: [],
    albums: [],
    composers: [],
    artists: [],
    genres: []
  }
  const libraryContents = await readDirAsync(libraryPath)
  for (const item of libraryContents) {
    const itemPath = path.join(libraryPath, item)
    const itemStat = await statAsync(itemPath)
    if (itemStat.isDirectory()) {
      await mediaIndexer.indexMedia(libraryPath, itemPath, library.media, existingData, readExistingFiles)
    }
  }
  const objectIndex = {}
  for (const item of library.media) {
    objectIndex[item.id] = item
  }
  await artistIndexer.indexArtists(library.media, library.artists, objectIndex)
  console.log('[indexer]', 'artists', library.artists.length)
  await genreIndexer.indexGenres(library.media, library.genres, objectIndex)
  console.log('[indexer]', 'genres', library.genres.length)
  await composerIndexer.indexComposers(library.media, library.composers, objectIndex)
  console.log('[indexer]', 'composers', library.composers.length)
  await albumIndexer.indexAlbums(library.media, library.albums, objectIndex)
  console.log('[indexer]', 'albums', library.albums.length)
  console.log('[indexer]', 'indexing album information')
  await albumIndexer.indexAlbumTracks(library.media, library.albums, objectIndex)
  await albumIndexer.indexAlbumGenres(library.media, library.albums, objectIndex)
  await albumIndexer.indexAlbumArtists(library.media, library.albums, objectIndex)
  await albumIndexer.indexAlbumComposers(library.media, library.albums, objectIndex)
  console.log('[indexer]', 'indexing composer information')
  await composerIndexer.indexComposerTracks(library.media, library.composers, objectIndex)
  await composerIndexer.indexComposerGenres(library.media, library.composers, objectIndex)
  await composerIndexer.indexComposerAlbums(library.albums, library.composers, objectIndex)
  console.log('[indexer]', 'indexing artist information')
  await artistIndexer.indexArtistTracks(library.media, library.artists, objectIndex)
  await artistIndexer.indexArtistGenres(library.media, library.artists, objectIndex)
  await artistIndexer.indexArtistAlbums(library.albums, library.artists, objectIndex)
  console.log('[indexer]', 'indexing genre information')
  await genreIndexer.indexGenreAlbums(library.albums, library.genres, objectIndex)
  await genreIndexer.indexGenreTracks(library.media, library.genres, objectIndex)
  await genreIndexer.indexGenreComposers(library.media, library.genres, objectIndex)
  await genreIndexer.indexGenreArtists(library.media, library.genres, objectIndex)
  return library
}
