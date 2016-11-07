#LegiScrap

Brazilian legislation scraper

##About
LegiScrap was created to organize Brazilian legislation and create a comprehensive API to get it.

##Configuration

###Database

The scrap gets the data and can be stored in files or on Mongo DB. Choose on of these options in the config/db/type.

##Debugging
LegiScrap uses (debug)[https://github.com/visionmedia/debug] for debugging.

To debug the scrap utility, run:

```bash
$ DEBUG=scrap,scrap-parser node scrap/index.js
```
The following debug options are set:
1. scrap
1. scrap-cleaner
1. scrap-parser
1. scrap-getter
1. split

To debug the API, run:

```bash
$ DEBUG=api,DB npm start
```

The following debug options are set:
1. api
1. DB

Most debugs are commented in the code and you must uncomment the ones you want to debug.
