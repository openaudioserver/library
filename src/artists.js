module.exports = {
  indexArtists,
  indexArtistGenres,
  indexArtistTracks,
  indexArtistAlbums
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

async function indexArtists (media, artists, index) {
  const uniqueKeys = []
  let objectNumber = Object.keys(index).length
  for (const track of media) {
    for (const i in track.artists) {
      const name = track.artists[i]
      const key = normalize(name)
      const existingIndex = uniqueKeys.indexOf(key)
      if (existingIndex === -1) {
        uniqueKeys.push(key)
        artists.push({
          type: 'artist',
          id: `artist_${objectNumber}`,
          name,
          displayName: name,
          sortName: name
        })
        track.artists[i] = artists[artists.length - 1].id
        objectNumber++
        index[track.artists[i]] = artists[artists.length - 1]
      } else {
        track.artists[i] = artists[existingIndex].id
      }
    }
  }
}

async function indexArtistTracks (media, artists, index) {
  for (const artist of artists) {
    artist.tracks = []
    const tracks = media.filter(track => track.artists.indexOf(artist.id) > -1)
    for (const track of tracks) {
      artist.tracks.push(track.id)
    }
  }
}

async function indexArtistGenres (media, artists, index) {
  for (const artist of artists) {
    artist.genres = []
    for (const trackid of artist.tracks) {
      const track = index[trackid]
      if (!track.genres) {
        continue
      }
      for (const genreid of track.genres) {
        if (artist.genres.indexOf(genreid) === -1) {
          artist.genres.push(genreid)
        }
      }
    }
  }
}

async function indexArtistAlbums (albums, artists, index) {
  for (const artist of artists) {
    artist.albums = []
    for (const album of albums) {
      if (!album.artists || album.artists.indexOf(artist.id) === -1) {
        continue
      }
      artist.albums.push(album.id)
    }
  }
}
