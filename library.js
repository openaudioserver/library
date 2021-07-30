const fs = require('fs')
const path = require('path')
const util = require('util')
const zlib = require('zlib')
const unzipAsync = util.promisify(zlib.unzip)
const statAsync = util.promisify(fs.stat)
const readFileAsync = util.promisify(fs.readFile)

module.exports = {
  load
}

if (process.argv[2] === 'load') {
  commandLineStart()
}

async function commandLineStart () {
  const libraryPaths = []
  let index = 3
  while (true) {
    const folderPath = process.argv[index]
    const exists = await existsAsync(folderPath)
    if (!exists) {
      break
    }
    libraryPaths.push(folderPath)
    index++
  }
  const library = await load(libraryPaths, true)
  console.log(JSON.stringify(library, null, '  '))
  return process.exit(0)
}

async function existsAsync (itemPath) {
  try {
    await statAsync(itemPath)
    return true
  } catch (error) {
    return false
  }
}

async function load (libraryPaths) {
  const consolidatedLibrary = {
    media: [],
    albums: [],
    artists: [],
    composers: [],
    genres: []
  }
  if (libraryPaths.length === 1) {
    await loadLibraryData(libraryPaths[0], consolidatedLibrary)
  } else {
    for (const libraryPath of libraryPaths) {
      await loadLibraryData(libraryPath, consolidatedLibrary)
    }
  }
  return consolidatedLibrary
}

async function loadLibraryData (libraryPath, libraryData) {
  const newData = await loadJSONFile(libraryPath, 'library.json')
  for (const key in newData) {
    libraryData[key] = libraryData[key] || []
    libraryData[key] = libraryData[key].concat(newData[key])
  }
  return libraryData
}

async function loadJSONFile (libraryPath, filename) {
  const fullFilePath = path.join(libraryPath, process.env.GZIP ? `${filename}.gz` : filename)
  const exists = await existsAsync(fullFilePath)
  if (exists) {
    const rawData = await readFileAsync(fullFilePath)
    if (!rawData || !rawData.length) {
      return
    }
    let data
    if (process.env.GZIP) {
      data = await unzipAsync(rawData)
    } else {
      data = rawData
    }
    return JSON.parse(data.toString())
  }
}
