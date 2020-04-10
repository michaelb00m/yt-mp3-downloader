# yt-mp3-Downloader
A little back- and frontend to download youtube videos, covert them to mp3 and download them

## Requisites
To run this project, you need to have a local installation of FFmpeg present on your system. You can download it from https://www.ffmpeg.org/download.html

Also a working installation of node and npm is obviously required. npm is shipped with node so you can get both from https://nodejs.org/en/download/

## Installation
Either download this as a .zip and unpack it or clone the github repository. Cloning the github repository works by installing git from https://git-scm.com/downloads, navigating to a directory where you want the repository to be saved and then typing into the console 
```sh
git clone https://github.com/michaelb00m/yt-mp3-downloader.git
```
After that, navigate into the newly created directory with the name yt-mp3-downloader. 
```sh
cd yt-mp3-downloader
```
Make sure you have node and npm installed. Then run npm install. After all dependencies have been installed you should be able to run npm start and the server is up and running at http://127.0.0.1:3141 or http://localhost:3141.
```sh
npm install # or just npm i
npm start
```