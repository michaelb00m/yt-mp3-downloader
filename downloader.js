// the library which is used to download and convert the youtube videos
const down = require('youtube-mp3-downloader');
const fs = require("fs");
const debug = false;

// start of the Downloader class delcaration
class Downloader {
    /**
     * the constructor function of the Downloader class
     * @param {any[]} finishListener   - an array of listener functions (or 
     *                                   only one) for the 'finished' event 
     *                                   emitted by down (optional, defaults
     *                                   to [])
     * @param {any[]} errorListener    - an array of listener functions (or 
     *                                   only one) for the 'error'
     *                                   event emitted by down (optional, 
     *                                   defaults to [])
     * @param {any[]} progressListener - an array of listener functions (or
     *                                   only one) for the 'progress' event 
     *                                   emitted by down (optional, defaults
     *                                   to [])
     */
    constructor (ffmpegPath, finishListener = [], errorListener = [], progressListener = []) {
        // initialization of the downloader instance
	if (typeof ffmpegPath === typeof []) 
	    throw new Error("the first argument must be a path to your ffmpeg installation");
	debug ? console.log(ffmpegPath) : null;
        this.YD = new down({
            // path to the ffmpeg executable
            ffmpegPath,
            // output path for the converted files
            outputPath: __dirname + '/out',
            // desired video quality
            youtubeVideoQuality: 'highest'
        });
        // sets the arrays: if the argument is not an empty array initalize it
        // as an empty array and add the array from the parameter, if it has
        // the default value initialize the array as an empty array
        finishListener !== [] ? this.subbedFinished = [].concat(finishListener) : this.subbedFinished = [];
        errorListener !== [] ? this.subbedError = [].concat(errorListener) : this.subbedError = [];
        progressListener !== [] ? this.subbedProgress = [].concat(progressListener) : this.subbedProgress = [];

        // setting the handler functions for the 3 events
        this.YD.on("finished", function(err, data) {
            // when this function is called, every function from the 
            // subbedfinish array is called with the given arguments
            // same for the other 2 events
            downloader.subbedFinished.forEach(listener => listener(data, downloader.id, err));
        });
         
        this.YD.on("error", function(error) {
	    debug ? console.log(error) : null;
            downloader.subbedError.forEach(listener => listener(error));
        });
        
        // the parameter of the function is obtained via object destructuring
        // { progress } https://wesbos.com/destructuring-objects/
        this.YD.on("progress", function({ progress }) {
	    debug ? console.log(progress) : null;
            downloader.subbedProgress.forEach(listener => listener(progress, downloader.id));
        });
    }

    // starts the download of the video
    download(id) {
        // sets the currently downloading id
        this.id = id;
        // starts the download
        this.YD.download(id);
    }

    // subscribes (adds to an array) a listener function to the subbedFinished
    // array
    subFinish(listener) {
        this.subbedFinished = this.subbedFinished.concat(listener);
    }

    subError(listener) {
        this.subbedError = this.subbedError.concat(listener);
    }

    subProgress(listener) {
        this.subbedProgress = this.subbedProgress.concat(listener);
    }
}

const config = JSON.parse(fs.readFileSync(__dirname + "/config.json").toString());
console.log(config);
const ffmpegPath = config.development.ffmpeg.path;

// initalizes an instance of the Downloader class
const downloader = new Downloader(ffmpegPath);

// exports the instance
module.exports = downloader;
