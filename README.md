cordova-build
=============

An easy way to handle your own cordova builds without using `Phonegap Build Server` and getting around <a target='_blank' href='http://www.slideshare.net/astoria0128/advantages-and-disadvantages-of-phone-gap-development-tools-23511998'>its disadvantages</a>)

## Requirements:
* Node
* A PC with Windows Phone SDK 8 installed
* A MAC with XCode 5.1 installed
* A PC / MAC / Linux with Android SDK installed

## Install
```
npm install -g cordova-build
```

## Usage

`cordova-build` can run in any of the next 4 different modes:

#### Server
```
cordova-build -mode:server
```

#### Agent
```
cordova-build -mode:agent -agent:wp8,android -agentwork:c:\temp
```

#### Client
```
cordova-build -mode:client -build:wp8,android,ios -files:common1.zip,common2.7z -wp8:wp8specific1.7z -android.7z -ios:iosspecific.7z
```

#### UI
```
cordova-build -mode:ui -server:DNS_OR_IP -port:SERVER_PORT
```



