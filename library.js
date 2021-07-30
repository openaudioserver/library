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

async function load (libraryPaths) {
  const library = {
    media: [],
    albums: [],
    artists: [],
    composers: [],
    genres: []
  }
  if (libraryPaths.length === 1) {
    await loadLibraryData(libraryPaths[0], library)
  } else {
    for (const libraryPath of libraryPaths) {
      await loadLibraryData(libraryPath, library)
    }
  }
  const objectIndex = {}
  for (const key in library) {
    for (const object of library[key]) {
      objectIndex[object.id] = object
    }
  }
  library.getObject = getObject
  library.getObjects = getObjects
  return library
}

async function loadLibraryData (libraryPath, libraryData) {
  const newData = await loadJSONFile(libraryPath, 'library.json')
  for (const key in newData) {
    if (key === 'media') {
      newData[key].libraryPath = libraryPath
      newData[key].artistPath = path.join(libraryPath, newData[key].artistFolder)
      newData[key].albumPath = path.join(libraryPath, newData[key].artistFolder, newData[key].albumFolder)
      newData[key].filePath = path.join(libraryPath, newData[key].artistFolder, newData[key].albumFolder, newData[key].fileName)
    }
    libraryData[key] = libraryData[key] || []
    libraryData[key] = libraryData[key].concat(newData[key])
  }
  return libraryData
}

async function loadJSONFile (libraryPath, filename) {
  const uncompressedFilePath = path.join(libraryPath, filename)
  const uncompessedFileExists = await existsAsync(uncompressedFilePath)
  if (uncompessedFileExists) {
    const rawData = await readFileAsync(uncompressedFilePath)
    if (!rawData || !rawData.length) {
      return
    }
    return JSON.parse(rawData.toString())
  }
  const gzippedFilePath = path.join(libraryPath, `${filename}.gz`)
  const gzippedFileExists = await existsAsync(gzippedFilePath)
  if (gzippedFileExists) {
    const rawData = await readFileAsync(gzippedFilePath)
    if (!rawData || !rawData.length) {
      return
    }
    const data = await unzipAsync(rawData)
    return JSON.parse(data.toString())
  }
}

async function existsAsync (itemPath) {
  try {
    await statAsync(itemPath)
    return true
  } catch (error) {
    return false
  }
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

function getObject(id) {
  if (!objectIndex[id]) {
    return null
  }
  return copyItem(objectIndex[id])
}

function getObjects(collection, options) {
  const unfilteredResults = []
  for (const object of collection) {
    const item = copyItem(object)
    unfilteredResults.push(item)
  }
  const results = filter(unfilteredResults, options)
  sort(results, options)
  return paginate(results, options)
}

function copyItem (source) {
  const item = {}
  for (const key in source) {
    if (!Array.isArray(source[key])) {
      item[key] = source[key]
      continue
    }
    item[key] = []
    for (const i in item[key]) {
      if (item[key][i] && item[key][i].length && item[key][i].indexOf('_')) {
        const entity = getObject(item[key][i])
        item[key][i] = {
          id: entity.id,
          type: entity.type,
          name: entity.name
        }
      }
    }
  }
  return {
    data: item
  }
}

function paginate (array, options) {
  const limit = options && options.limit ? parseInt(options.limit, 10) : 0
  const offset = options && options.offset ? parseInt(options.offset, 10) : 0
  const sizeWas = array.length
  if (offset) {
    array.splice(0, offset)
  }
  if (array.length > limit) {
    array.length = limit
  }
  return {
    data: array,
    offset,
    limit,
    total: sizeWas,
  }
}

function filter (array, options) {
  const filtered = []
  for (const item of array) {
    let group
    if (options.composer) {
      group = 'composer'
      const value = options[group]
      const array = item[group + 's']
      if (!value || !array || !array.length) {
        continue
      }
      const normalized = normalize(value)
      const matchType = normalize(options[`${field}Match`])
      const found = matchInArray(array, matchType, normalized)
      if (!found || !found.length) {
        continue
      }
    }
    if (options.artist) {
      group = 'artist'
      const value = options[group]
      const array = item[group + 's']
      if (!value || !array || !array.length) {
        continue
      }
      const normalized = normalize(value)
      const matchType = normalize(options[`${field}Match`])
      const found = matchInArray(array, matchType, normalized)
      if (!found || !found.length) {
        continue
      }
    }
    if (options.genre) {
      group = 'genre'
      const value = options[group]
      const array = item[group + 's']
      if (!value || !array || !array.length) {
        continue
      }
      const normalized = normalize(value)
      const matchType = normalize(options[`${field}Match`])
      const found = matchInArray(array, matchType, normalized)
      if (!found || !found.length) {
        continue
      }
    }
    if (options.keyword) {
      const normalized = normalize(options.keyword) 
      const matchType = normalize(options.keywordMatch)
      const found = matchValue(item, 'name', matchType, normalized)
      if (!found) {
        continue
      }
    }
    filtered.push(item)
  }
  return filtered
}

function sort (array, options) {
  if (!options.sort) {
    return array
  }
  const sortField = option.sort
  const sortDirection = option.sortDirection
  array.sort(a, b => {
    if (sortDirection === 'DESC') {
      if (!a[sortField]) {
        return 1
      } else if (!b[sortField]) {
        return -1
      } else if (Array.isArray[a[sortField]]) {
        return normalize(a[sortField].join(',')) < normalize(b[sortField].join(',')) ? 1 : -1
      } else if (a[sortField] < 0 || a[sortField] > 0 || a[sortField] === 0) {
        return a[sortField] < b[sortField] ? 1 : -1
      } else {
        return normalize(a[sortField]) < normalize(b[sortField]) ? 1 : -1
      }
    } else {
      if (!a[sortField]) {
        return -1
      } else if (!b[sortField]) {
        return 1
      } else if (Array.isArray[a[sortField]]) {
        return normalize(a[sortField].join(',')) > normalize(b[sortField].join(',')) ? 1 : -1
      } else if (a[sortField] < 0 || a[sortField] > 0 || a[sortField] === 0) {
        return a[sortField] > b[sortField] ? 1 : -1
      } else {
        return normalize(a[sortField]) > normalize(b[sortField]) ? 1 : -1
      }
    }
  })
  return array
}

function matchInArray (array, matchType, value) {
  const normalizedValue = normalize(value)
  if (matchType === 'start' || matchType === 'starts') {
    return array.filter(entity => normalize(entity.name).startsWith(normalizedValue))
  } else if (matchType === 'end' || matchType === 'ends') {
    return array.filter(entity => normalize(entity.name).endsWith(normalizedValue))
  } else if (matchType === 'contain' || matchType === 'contains') {
    return array.filter(entity => normalize(entity.name).indexOf(normalizedValue) > -1)
  } else if (matchType === 'exclude' || matchType === 'excludes') {
    return array.filter(entity => normalize(entity.name).indexOf(normalizedValue) === -1)
  }
  return array.filter(entity => normalize(entity.name) === normalized)
}

function matchValue (item, property, matchType, value) {
  const normalizedProperty = normalize(item[property])
  const normalizedValue = normalize(value)
  if (matchType === 'start' || matchType === 'starts') {
    return normalizedProperty.startsWith(normalizedValue)
  } else if (matchType === 'end' || matchType === 'ends') {
    return normalizedProperty.endsWith(normalizedValue)
  } else if (matchType === 'contain' || matchType === 'contains') {
    return normalizedProperty.indexOf(normalizedValue) > -1
  } else if (matchType === 'exclude' || matchType === 'excludes') {
    return normalizedProperty.indexOf(normalizedValue) === -1
  }
  return normalizedProperty === normalizedValue
}
