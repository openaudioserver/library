const fs = require('fs')
const MusicMetaData = require('music-metadata')
const path = require('path')
const util = require('util')
const statAsync = util.promisify(fs.stat)
const readDirAsync = util.promisify(fs.readdir)

module.exports = {
  indexMedia
}

async function indexMedia (libraryPath, folderPath, media, existingData, readExistingFiles) {
  const folderContents = await readDirAsync(folderPath)
  for (const item of folderContents) {
    const itemPath = path.join(folderPath, item)
    const itemStat = await statAsync(itemPath)
    if (itemStat.isDirectory()) {
      indexMedia(libraryPath, itemPath, media, existingData, readExistingFiles)
      continue
    }
    const filePath = path.join(folderPath, item)
    if (!readExistingFiles && existingData) {
      const existingFile = existingData.filter(item => item.file.path === filePath)[0]
      if (existingFile) {
        media.push(existingFile[0])
        continue
      }
    }
    const fileStat = await statAsync(filePath)
    if (fileStat.isDirectory()) {
      continue
    }
    const extension = filePath.split('.').pop().toLowerCase()
    if (extension !== 'mp3' && extension !== 'flac') {
      continue
    }
    let metaData
    try {
      metaData = await MusicMetaData.parseFile(filePath)
    } catch (error) {
      console.error('error reading meta data', filePath, error)
    }

    const fileParts = filePath.substring(libraryPath.length).split(path.sep)
    const track = {
      id: `track_${media.length + 1}`,
      type: 'audio',
      title: metaData.common.title,
      displayTitle: metaData.common.displaytitle,
      sortTitle: metaData.common.sortitle,
      year: metaData.common.year || '',
      album: metaData.common.album || fileParts[1],
      albumFolder: fileParts[1],
      albumPath: filePath.substring(0, filePath.indexOf(fileParts[1]) + fileParts[1].length),
      albumArtist: metaData.common.albumartist || fileParts[0],
      artistFolder: fileParts[0],
      artistPath: filePath.substring(0, filePath.indexOf(fileParts[0]) + fileParts[0].length),
      libraryPath,
      comment: metaData.common.comment ? metaData.common.comment.join('\n') : '',
      file: {
        path: filePath,
        size: fileStat.size,
        duration: metaData.format.duration,
        bitRate: metaData.format.bitrate,
        codec: metaData.format.codec.toLowerCase(),
        container: metaData.format.container.toLowerCase(),
        sampleRate: metaData.format.container.sampleRate,
        numberOfChannels: metaData.format.container.numberOfChannels,
        lossless: metaData.format.lossless
      }
    }
    if (metaData.common.disk && metaData.common.disk.no) {
      track.discNumber = metaData.common.disk.no
      track.discsTotal = metaData.common.disk.of || metaData.common.disk.no || 0
    }
    if (item.track && item.track.no !== 0) {
      track.trackNumber = metaData.common.track.no
      track.tracksTotal = metaData.common.track.of || metaData.common.track.no || 0
    }
    if (item.year && item.year > 0) {
      track.year = item.year
    }
    if (metaData.common.picture && metaData.common.picture.length) {
      track.images = []
      for (const image of metaData.common.picture) {
        track.images.push({
          format: image.format,
          type: image.type,
          size: image.data.length
        })
      }
    }
    if (!metaData.common.artist) {
      track.artists = [fileParts[0]]
    } else if (!Array.isArray(metaData.common.artist)) {
      track.artists = [metaData.common.artist]
    } else {
      track.artists = metaData.common.artist || []
    }
    if (track.artists.length === 1 && track.artists[0].indexOf(',') > -1) {
      track.artists = track.artists[0].split(',')
    }
    if (!metaData.common.composer) {
      track.composers = []
    } else if (!Array.isArray(metaData.common.composer)) {
      track.composers = [metaData.common.composer]
    } else {
      track.composers = metaData.common.composer
    }
    if (track.composers.length === 1 && track.composers[0].indexOf(',') > -1) {
      track.composers = track.composers[0].split(',')
    }
    if (!metaData.common.genre) {
      track.genres = []
    } else if (!Array.isArray(metaData.common.genre)) {
      track.genres = [metaData.common.genre]
    } else {
      track.genres = metaData.common.genre
    }
    if (track.genres.length === 1 && track.genres[0].indexOf(',') > -1) {
      track.genres = track.genres[0].split(',')
    }
    media.push(track)
  }
}
