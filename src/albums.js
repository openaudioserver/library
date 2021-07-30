function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

module.exports = {
  indexAlbums,
  indexAlbumTracks,
  indexAlbumGenres,
  indexAlbumComposers,
  indexAlbumArtists
}

async function indexAlbums (media, albums, index) {
  let objectNumber = Object.keys(index).length
  const albumIndex = []
  for (const track of media) {
    const key = normalize(track.artists[0] + track.album)
    const existingIndex = albumIndex.indexOf(key)
    if (existingIndex === -1) {
      albumIndex.push(key)
      albums.push({
        type: 'album',
        id: `album_${objectNumber}`,
        name: track.album,
        displayName: track.album,
        sortName: track.album,
        artist: track.artists[0]
      })
      track.albumid = albums[albums.length - 1].id
      index[track.albumid] = albums[albums.length - 1]
      objectNumber++
    } else {
      track.albumid = albums[existingIndex].id
    }
  }
}

async function indexAlbumTracks (media, albums, index) {
  for (const album of albums) {
    album.tracks = []
    const tracks = media.filter(track => track.albumid === album.id)
    for (const track of tracks) {
      album.tracks.push(track.id)
    }
  }
}

async function indexAlbumGenres (media, albums, index) {
  for (const album of albums) {
    album.genres = []
    for (const trackid of album.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (album.genres.indexOf(genreid) === -1) {
          album.genres.push(genreid)
        }
      }
    }
  }
}

async function indexAlbumComposers (media, albums, index) {
  for (const album of albums) {
    album.composers = []
    for (const trackid of album.tracks) {
      const track = index[trackid]
      if (!track.composers) {
        continue
      }
      for (const composerid of track.composers) {
        if (album.composers.indexOf(composerid) === -1) {
          album.composers.push(composerid)
        }
      }
    }
  }
}

async function indexAlbumArtists (media, albums, index) {
  for (const album of albums) {
    album.genres = []
    for (const trackid of album.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (album.genres.indexOf(genreid) === -1) {
          album.genres.push(genreid)
        }
      }
    }
  }
}
