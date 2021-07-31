const fs = require('fs')
const path = require('path')
const util = require('util')
const zlib = require('zlib')
const gzipAsync = util.promisify(zlib.gzip)

module.exports = {
  scan
}

if (process.argv[1] === __filename) {
  commandLineStart()
}

async function commandLineStart () {
  const libraryPaths = []
  const moduleNames = []
  let index = 2
  while (true) {
    try {
      require.resolve(folderPath)
      moduleNames.push(folderPath)
    } catch (error) {
      break
    }
    index++
  }
  while (true) {
    const folderPath = process.argv[index]
    const exists = await fs.existsSync(folderPath)
    if (!exists) {
      break
    }
    libraryPaths.push(folderPath)
    index++
  }
  await scan(libraryPaths, moduleNames)
  console.log('[indexer]', 'finished scanning')
  return process.exit(0)
}

async function scan (libraryPaths, moduleNames) {
  const startTime = process.hrtime()
  for (const libraryPath of libraryPaths) {
    const library = await scanLibrary(libraryPath)
    for (const moduleName of moduleNames) {
      const module = require(moduleName)
      if (module.scan) {
        console.log('[indexer]', 'module scanning library', moduleName)
        await module.scan(library, libraryPath)
      }
    }
  }
  const stopTime = process.hrtime(startTime)
  console.info('[indexer', 'total scan time:', stopTime[0] + 's', stopTime[1] / 1000000 + 'ms')
}

async function scanLibrary (libraryPath) {
  const startTime = process.hrtime()
  console.log('[indexer]', 'scanning library', libraryPath)
  const libraryFileName = process.env.GZIP ? 'index.json.gzip' : 'index.json'
  const libraryDataPath = path.join(libraryPath, libraryFileName)
  const library = {
    files: [],
    tree: {
      type: 'folder',
      id: 'folder_1',
      folder :'root',
      contents: []
    }
  }
  console.log('[indexer]', 'indexing files')
  const folder = {
    type: 'folder',
    path: libraryPath,
    contents: []
  }
  library.tree.contents.push(folder)
  await indexFolder(library, folder.contents, libraryPath, libraryPath)
  if (process.env.GZIP) {
    console.log('[indexer]', 'compressing data')
    const compressedData = await gzipAsync(JSON.stringify(library))
    console.log('[indexer]', 'writing compressed data', compressedData.length)
    fs.writeFileSync(libraryDataPath, compressedData)
  } else {
    const buffer = Buffer.from(JSON.stringify(library, null, '  '))
    console.log('[indexer]', 'writing uncompressed data', buffer.length)
    fs.writeFileSync(libraryDataPath, buffer)
  }
  const stopTime = process.hrtime(startTime)
  console.log('[indexer]', 'library scan time:', stopTime[0] + 's', stopTime[1] / 1000000 + 'ms')
}

async function indexFolder(library, parentContents, currentFolder, libraryPath) {
  console.log('[indexer]', 'indexing folder', currentFolder)
  const folderContents = fs.readdirSync(currentFolder)
  for (const item of folderContents) {
    const itemPath = path.join(currentFolder, item)
    const itemStat = fs.statSync(itemPath)
    if (itemStat.isDirectory()) {
      const folder = {
        type: 'folder',
        folder: item,
        path: itemPath,
        contents: []
      }
      parentContents.push(folder)
      await indexFolder(library, folder.contents, folder.path, libraryPath)
      continue
    }
    const extension = itemPath.split('.').pop().toLowerCase()
    const file = {
      type: 'file',
      id: `file_${library.files.length + 1}`,
      extension,
      file: item,
      size: itemStat.size,
      path: itemPath
    }
    parentContents.push({ type: 'file', id: file.id })
    library.files.push(file)
  }
}
