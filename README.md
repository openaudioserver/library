# Library Index

This is a media library indexer for NodeJS servers to asynchronously traverse a root folder, expecting artist folders within it, and album folders within them, to catalog any media files that it finds.  After cataloging the media the indexer will save the JSON data, optionally compressed with GZIP.

Multiple folders can be indexed.  Each will contain their own JSON catalogs, that merge into a single catalog when loading.

## Supported folder structure

/library/artist/album/file
/library/artist/file
/library/file

## Add to your NodeJS project

    $ npm install node-media-library

### Run the indexer from command line

    $ git clone https://github.com/openaudioserver/library-scanner
    $ cd library-scanner
    $ npm install

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
        type:               track
        id:                 string
        title:              string
        comment:            string
        displayTitle:       string
        sortTitle:          string
        year:               integer
        artists:            array [ artistids ]
        composers:          array [ composerids ]
        genres:             array [ genreids ]
        album:              string
        albumFolder:        string
        albumPath:          string
        albumArtist:        string
        artistFolder:       string
        artistPath:         string
        libraryPath:        string
        file: {
          bitRate:          integer
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
        type:               album
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        artists:            array [ artistids ]
        composers:          array [ composerids ]
        genres:             array [ genreids ]
        tracks:             array [ trackids ]
      }],
      artists: [{
        type:               artist
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             array [ albumids ]
        composers:          array [ composerids ]
        genres:             array [ genreids ]
        tracks:             array [ trackids ]
      }],
      composers: [{
        type:               composer
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             array [ albumids ]
        artists:            array [ artistids ]
        composers:          array [ composerids ]
        genres:             array [ genreids ]
        tracks:             array [ trackids ]
      }],
      genres: [{
        type:               genre
        id:                 string
        name:               string
        displayName:        string
        sortName:           string
        albums:             array [ albumids ]
        artists:            array [ artistids ]
        composers:          array [ composerids ] 
        tracks:             array [ trackids ]
      }]
    }

## License

MIT