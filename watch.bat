@rem browserify server/public/js/index.js -o server/public/js/bundle.js --debug
browserify server/public/js/index.js --debug | exorcist server/public/js/bundle.js.map > server/public/js/bundle.js 