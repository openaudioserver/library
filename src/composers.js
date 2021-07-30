module.exports = {
  indexComposers,
  indexComposerAlbums,
  indexComposerGenres,
  indexComposerTracks
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

async function indexComposers (media, composers, index) {
  const uniqueKeys = []
  let objectNumber = Object.keys(index).length
  for (const track of media) {
    for (const i in track.composers) {
      const name = track.composers[i]
      const key = normalize(name)
      const existingIndex = uniqueKeys.indexOf(key)
      if (existingIndex === -1) {
        uniqueKeys.push(key)
        composers.push({
          type: 'composer',
          id: `composer_${objectNumber}`,
          name,
          displayName: name,
          sortName: name
        })
        track.composers[i] = composers[composers.length - 1].id
        index[track.composers[i]] = composers[composers.length - 1]
        objectNumber++
      } else {
        track.composers[i] = composers[existingIndex].id
      }
    }
  }
}

async function indexComposerTracks (media, composers) {
  for (const composer of composers) {
    composer.tracks = []
    const tracks = media.filter(track => track.composers.indexOf(composer.id) > -1)
    for (const track of tracks) {
      composer.tracks.push(track.id)
    }
  }
}

async function indexComposerGenres (media, composers, index) {
  for (const composer of composers) {
    composer.genres = []
    for (const trackid of composer.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (composer.genres.indexOf(genreid) === -1) {
          composer.genres.push(genreid)
        }
      }
    }
  }
}

async function indexComposerAlbums (albums, composers) {
  for (const composer of composers) {
    composer.albums = []
    for (const album of albums) {
      if (!album.composers || album.composers.indexOf(composer.id) === -1) {
        continue
      }
      composer.albums.push(album.id)
    }
  }
}
