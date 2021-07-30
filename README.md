# Library Index


This is a media library indexer for NodeJS that asynchronously traverses your library root folder(s) and catalogs media files, indexes some metadata and file information, and saves a JSON catalog for music software. 

You can clone the project and run it from a command line:

    $ node scanner.js /path/to/music /optional/second/path

Or use it as a module in NodeJS to support your project: 

    const libraryIndex = require('library-index)
    const library = await library.load(['/path/to/music', '/other/path/to/music'])

Each library folder you specify will save a `library.json` file.  When you load your library these files are merged together into a single library.

Your folder structure should be `/library/artist/album/file`.

### Documentation

- [Indexing media from command line](#indexing-media-from-command-line)
- [Indexing media with NodeJS](#indexing-media-with-nodejs)
- [Using the media index with NodeJS](#using-the-media-index-with-nodejs)
- [Library data structure](#library-data-structure)

## Indexing media from command line 

    $ git clone https//github.com/openaudioserver/library-scanner
    $ cd library-scanner
    $ npm install

Scan a single library path:

    $ node scanner.js /path/to/music

Scan a library with multiple folders:

    $ node scanner.js /path/to/music /path/to/more/music /path/to/other/music

Compress the index with gzip:

    $ GZIP=true node scanner.js /path/to/music

Loading a library from the command line outputs the JSON data:

    $ node library.js /path/to/music /path/to/more/music /path/to/other/music

[Top of page](#documentation)

## Indexing media with NodeJS

    const libraryIndex = require('@openaudioserver/library-index')

Run the scanner:

    await libraryIndex.scan([
      '/path/to/music',
      '/path/to/more/music',
      '/path/to/other/music'
    ])

Load the library:

    const library = await libraryIndex.load([
      '/path/to/music',
      '/path/to/more/music',
      '/path/to/other/music'
    ])

[Top of page](#documentation)

## Using the media index with NodeJS

You can use NodeJS to access objects and work with the library's media, artists, genres, composers and albums arrays.  The id arrays convert to objects with name, type and id.

Library objects can be retrieved with an ID:

    NODEJS library.getObject(albumid)

    OBJECT RESPONSE {
      data: {
        type               album
        id                 string
        name               string
        displayName        string
        sortName           string
        artists            array [ artists ]
        composers          array [ composers ]
        genres             array [ genres ]
        tracks             array [ tracks ]
      }
    }

Library arrays can be filtered, sorted and paginated:

    NODEJS library.getObjects(library.albums, {
      sort                 string
      sortDirection        string asc|desc
      offset               integer
      limit                integer
      keyword              string
      keywordMatch         string equal|start|end|exclude|contain
      <field>              string
      <field>Match         string
    })

    OBJECT RESPONSE  {
      offset,
      limit,
      total,
      data: [{
        type               track
        id                 string
        path               string
        size               integer
        title              string
        comment            string
        displayTitle       string
        sortTitle          string
        year               integer
        artists            array [ artists ]
        composers          array [ composers ]
        genres             array [ genres ]
        album              string
        albumFolder        string
        albumArtist        string
        artistFolder       string
        libraryPath        string
        bitRate            integer
        codec              string
        fileContainer      string
        duration           float
        lossless           boolean
        numberOfChannels   integer
        sampleRate         integer
      }]
    }

[Top of page](#documentation)

## Library data structure

This is the data structure of the index.

    LIBRARY OBJECT {
      media [{
        type               track
        id                 string
        path               string
        size               integer
        title              string
        comment            string
        displayTitle       string
        sortTitle          string
        year               integer
        artists            array [ artistids ]
        composers          array [ composerids ]
        genres             array [ genreids ]
        album              string
        albumFolder        string
        albumArtist        string
        artistFolder       string
        libraryPath        string
        bitRate            integer
        codec              string
        fileContainer      string
        duration           float
        lossless           boolean
        numberOfChannels   integer
        sampleRate         integer
      }],
      albums [{
        type               album
        id                 string
        name               string
        displayName        string
        sortName           string
        artists            array [ artistids ]
        composers          array [ composerids ]
        genres             array [ genreids ]
        tracks             array [ trackids ]
      }],
      artists [{
        type               artist
        id                 string
        name               string
        displayName        string
        sortName           string
        albums             array [ albumids ]
        composers          array [ composerids ]
        genres             array [ genreids ]
        tracks             array [ trackids ]
      }],
      composers [{
        type               composer
        id                 string
        name               string
        displayName        string
        sortName           string
        albums             array [ albumids ]
        artists            array [ artistids ]
        genres             array [ genreids ]
        tracks             array [ trackids ]
      }],
      genres [{
        type               genre
        id                 string
        name               string
        displayName        string
        sortName           string
        albums             array [ albumids ]
        artists            array [ artistids ]
        composers          array [ composerids ] 
        tracks             array [ trackids ]
      }]
    }

[Top of page](#documentation)

## License

MIT
