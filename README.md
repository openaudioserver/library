# Library

Library indexes all the files within one or more folders and maps the folder structure.  It can be extended with modules to index specific types of files and collect metadata information.

### Documentation

- [How to use](#how-to-use)
- [Index data structure](#index-data-structure)
- [Modules](#library-modules)
- [Compressing index files](#compressing-index-files)
- [Indexing media from command line](#indexing-media-from-the-command-line)
- [Loading index from command line](#loading-index-from-the-command-line)
- [Indexing media with NodeJS](#indexing-media-with-nodejs)
- [Using the media index with NodeJS](#using-the-media-index-with-nodejs)

## How to use 

You can clone the project and run it from a command line:

    $ git clone https//github.com/openaudioserver/library
    $ cd library
    $ node scanner.js /path/to/files

It can work with multiple paths:

    $ node scanner.js /path/to/files /optional/second/path

And load modules from the command line:

    $ node scanner.js @openaudioserver/library-music /path/to/files

Or use it as a module in NodeJS to support your project: 

    const Library = require('library')
    const library = await Library.load([
      '/path/to/music', 
      '/other/path/to/music'
      ], [
        '@openaudioserver/library-music'
    ])

[Top of page](#documentation)    

## Index data structure

This is the data structure of the index.  Files can be sorted, filtered and paginated.  The tree maps the folder nesting structure.

    LIBRARY INDEX {
      files [{
        type               file
        id                 string
        file               string
        path               string
        size               integer
      }],
      tree: {
        type               folder
        id                 string
        folder             string
        path               string
        items              array [{folder|file}]
      }
    }

[Top of page](#documentation)

### Library modules

| Module name                    | Description                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| @openaudioserver/library-music | Indexes library files for `MP3` and `FLAC` media and adds songs, albums, genres, and credited persons to your library | 

[Top of page](#documentation)

### Compressing index files

JSON is very verbose and can be heavily-compressed by setting an environment variable:

    $ export GZIP_LIBRARY_DATA=true

You can configure this permanently in Ubuntu:

    $ echo "GZIP_LIBRARY_DATA=true" >> ~/.bashrc

Specify it when scanning or loading libraries:

    $ GZIP_LIBRARY_DATA=true node scanner.js /path/to/music

    $ GZIP_LIBRARY_DATA=true node library.js /path/to/music

[Top of page](#documentation)

## Indexing media from the command line 

The command line arguments are module names and then paths:

    $ node scanner.js module1 module2 moduleN path1

    $ node scanner.js /path/to/folder

    $ node scanner.js @openaudioserver/library-music /path/to/music

[Top of page](#documentation)

## Loading media from the command line 

The command line arguments are module names and then paths:

    $ node library.js @openaudioserver/library-music /path/to/music /path/to/more/music /path/to/other/music

[Top of page](#documentation)

## Indexing media with NodeJS

    const Library = require('@openaudioserver/library')

In NodeJS the module names and paths are specified using arrays:

    await Library.scan([
        '@openaudioserver/library-music'
    ], [
      '/path/to/music'
    ])

Load the library:

    await Library.load([
        '@openaudioserver/library-music'
    ], [
      '/path/to/music'
    ])

[Top of page](#documentation)

## Using the media index with NodeJS

You can use NodeJS to access objects and work with arrays of objects.

Objects can be retrieved with an ID:

    NODEJS library.getObject(fileid)

    OBJECT RESPONSE {
      data: {
        type               album
        id                 string
        file               string
        size               integer
      }
    }

Library arrays can be filtered, sorted and paginated:

    NODEJS library.getObjects(library.files, {
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
        type               album
        id                 string
        file               string
        size               integer
      }]
    }

[Top of page](#documentation)

## License

MIT
