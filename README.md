# Library Index

This is a media library indexer for NodeJS servers to scan designated folder(s) and index the songs.  

## Required folder structure

/library-folder/artist/album/file
/library-folder/artist/file
/library-folder/file

## Add to your NodeJS project

    $ npm install node-media-library

### Run the indexer

Create a JSON index:

    $ node indexer.js scan /path/to/music
    $ node indexer.js scan /path/to/music


Specify multiple folders:

    $ node indexer.js scan /path/to/music /path/to/more/music /path/to/other/music
    $ node indexer.js load /path/to/music /path/to/more/music /path/to/other/music

Compress the index with gzip:

    $ GZIP=true node indexer.js /path/to/music

### Use the indexed data in your project

    const libraryIndex = require('@openaudioserver/library-index')

    INDEX LIBRARY
      await libraryIndex.index([
        '/path/to/music',
        '/path/to/more/music',
        '/path/to/other/music'
      ])

    LOAD LIBRARY
      const library = await libraryIndex.load([
        '/path/to/music',
        '/path/to/more/music',
        '/path/to/other/music'
      ])

    LIBRARY OBJECT {
      media: [{
        type:               *track*
        id:                 string
        title:              string
        comment:            string
        displayTitle:       string
        sortTitle:          string
        year:               integer
        artists:            <array>[ artistids ]
        composers:          <array>[ composerids ]
        genres:             <array>[ genreids ]
        album:              string
        albumFolder:        string
        albumPath:          string
        albumArtist:        string
        artistFolder:       string
        artistPath:         string
        libraryPath:        string
        file: {
          bitRate:          int
          codec:            string
          container:        string
          duration:         float
          lossless:         boolean
          numberOfChannels: integer
          sampleRate:       integer
          size:             integer
        }
      }],
      albums: [{
        type:               *album*
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        artists:            <array>[ artistids ]
        composers:          <array>[ composerids ]
        genres:             <array>[ genreids ]
        tracks:             <array>[ trackids ]
      }],
      artists: [{
        type:               *artist*
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             <array>[ albumids ]
        composers:          <array>[ composerids ]
        genres:             <array>[ genreids ]
        tracks:             <array>[ trackids ]
      }],
      composers: [{
        type:               *composer*
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             <array>[ albumids ]
        artists:            <array>[ artistids ]
        composers:          <array>[ composerids ]
        genres:             <array>[ genreids ]
        tracks:             <array>[ trackids ]
      }],
      genres: [{
        type:               genre
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             <array>[ albumids ]
        artists:            <array>[ artistids ]
        composers:          <array>[ composerids ] 
        tracks:             <array>[ trackids ]
      }]
    }

## License

MIT