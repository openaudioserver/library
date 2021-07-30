module.exports = {
  indexGenres,
  indexGenreTracks,
  indexGenreComposers,
  indexGenreAlbums,
  indexGenreArtists
}

function normalize (text) {
  return text.toLowerCase().replace(/[\W_]+/g, ' ')
}

async function indexGenres (media, genres, index) {
  const uniqueKeys = []
  let objectNumber = Object.keys(index).length
  for (const track of media) {
    for (const i in track.genres) {
      const name = track.genres[i]
      const key = normalize(name)
      const existingIndex = uniqueKeys.indexOf(key)
      if (existingIndex === -1) {
        uniqueKeys.push(key)
        genres.push({
          type: 'genre',
          id: `genre_${objectNumber}`,
          name,
          displayName: name,
          sortName: name
        })
        track.genres[i] = genres[genres.length - 1].id
        index[track.genres[i]] = genres[genres.length - 1]
        objectNumber++
      } else {
        track.genres[i] = genres[existingIndex].id
      }
    }
  }
}

async function indexGenreTracks (media, genres) {
  for (const genre of genres) {
    genre.tracks = []
    const tracks = media.filter(track => track.genres && track.genres.indexOf(genre.id) > -1)
    for (const track of tracks) {
      genre.tracks.push(track.id)
    }
  }
}

async function indexGenreComposers (media, genres, index) {
  for (const genre of genres) {
    genre.composers = []
    for (const trackid of genre.tracks) {
      const track = index[trackid]
      if (!track.composers) {
        continue
      }
      for (const composerid of track.composers) {
        if (genre.composers.indexOf(composerid) === -1) {
          genre.composers.push(composerid)
        }
      }
    }
  }
}

async function indexGenreArtists (media, genres) {
  for (const genre of genres) {
    genre.artists = []
    for (const trackid of genre.tracks) {
      const track = media.filter(track => track.id === trackid)[0]
      if (!track.artists) {
        continue
      }
      for (const artistid of track.artists) {
        if (genre.artists.indexOf(artistid) === -1) {
          genre.artists.push(artistid)
        }
      }
    }
  }
}

async function indexGenreAlbums (albums, genres) {
  for (const genre of genres) {
    genre.albums = []
    for (const album of albums) {
      if (!album.genres || album.genres.indexOf(genre.id) === -1) {
        continue
      }
      genre.albums.push(album.id)
    }
  }
}
