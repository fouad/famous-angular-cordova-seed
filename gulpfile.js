'use strict';

/////
// Dependencies
/////

var gulp = require('gulp');
var Q = require('q');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')();
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var clean = require('gulp-clean');
var lr = require('gulp-livereload');
var express = require('express');
var morgan = require('morgan');
var buildConfig = require('./gulpconfig.js');
var pkg = require('./package.json');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var moduleName = pkg.name;

/////
// Paths
/////

var app = './app/';
var paths = {
  targetDir: './www/',
  cssTarget: 'css/styles.css',
  sass: [app+'scss/**/*.scss', '!'+app+'scss/**/_*.scss'],
  images: 'img/',
  appScriptsRoot: app+'js/',
  appScripts: [
    'app.js',
    'templates.js',
    '**/*.js'
  ],
  appScriptsTarget: 'js/app.js',
  bowerLibScriptsRoot: app+'lib/',
  bowerLibScripts:[
    'angular/angular.js',
    'ngCordova/dist/ng-cordova.js',
    'angular-ui-router/release/angular-ui-router.js',
    'famous/dist/famous-global.js',
    'famous-angular/dist/famous-angular.js'
  ],
  libScriptsTarget: 'lib/all.js',
  templates: app+'templates/**/*.html'
};

/////
// Default Tasks
/////

gulp.task('serve', ['build'], function() {
  browserSync({
    notify: false,
    server: {
      baseDir: ['www']
    },
    port: "8000"
  });

  gulp.watch(['app/**/*.html'], ['templates', reload]);
  gulp.watch(['app/**/*.scss'], ['sass']);
  gulp.watch(['www/css/styles.css'], reload);
  gulp.watch(['app/**/*.js'], ['libScripts', 'libAssets', 'appScripts']);
  gulp.watch(['www/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('default', function() {
  return runSequence('clean', 'build');
});

/////
// Setup Dependencies
/////

gulp.task('setup', function (cb) {
  runSequence(
    'setup:clean',
    'platform',
    'plugins',
    cb);
});

gulp.task('platform', function (cb) {
  runCommand('ionic platform add '+buildConfig.platform)().then(cb);
});

gulp.task('plugins', function (cb) {
  return runCommandSequence([
    'org.apache.cordova.device',
    'org.apache.cordova.statusbar',
    'https://github.com/driftyco/ionic-plugins-keyboard.git'
  ].map(function(p) {
    return 'cordova plugin add ' +p;
  }));
});

gulp.task('setup:clean', function (cb) {
  var commands = ['rm -rf app/lib'];
  [
    'plugins',
    'platforms',
    'www'
  ].forEach(function (d) {
      commands.push('rm -rf '+d);
      commands.push('mkdir '+d);
  });
  return runCommandSequence(commands);
});

/////
// Build App
/////

gulp.task('build', function () {
   return runSequence(
     ['templates', 'sass', 'images', 'libScripts', 'libAssets'],
     ['appScripts', 'appAssets'],
     'icons'
   );
});

gulp.task('rebuild', function () {
  return runSequence('clean', 'build');
});

gulp.task('clean', ['clean:assets', 'clean:templates'], function(done) {
  return runCommandSequence(['rm -rf www', 'mkdir www']);
});

gulp.task('clean:templates', function () {
  return runCommand('rm '+paths.appScriptsRoot+'templates.js')();
});

gulp.task('clean:assets', function() {
  return gulp.src(
    buildConfig.platform === 'android' ?
      paths.androidIconsDest + 'drawable*' :
      [paths.iosSplashDest + '*', paths.iosIconsDest + '*'],
      {read: false})
    .pipe(clean());
});

gulp.task('sass', function(done) {
  return gulp.src(paths.sass)
    .pipe(sass())
    .pipe(concat(paths.cssTarget))
    .pipe(gulp.dest(paths.targetDir))
    .pipe($.size({title: 'sass'}));
});

gulp.task('icons', function() {
  return gulp.src(app + 'res/**')
    .pipe(gulp.dest(paths.targetDir + 'res/'));
});

gulp.task('images', function() {
  return gulp.src(app + paths.images + '*')
    .pipe(gulp.dest(paths.targetDir + paths.images));
});

gulp.task('templates', function () {
  return gulp.src(paths.templates)
    .pipe(templateCache({module: moduleName + '.templates'}))
    .pipe(gulp.dest(paths.appScriptsRoot))
    .pipe($.size({title: 'templates'}));
});

gulp.task('appAssets', ['appAssets:copyIndexHtml']);

gulp.task('appAssets:copyIndexHtml', function (cb) {
  return runCommand('cp '+app+'index.html '+paths.targetDir)();
});

gulp.task('libScripts', function () {
  return gulp.src(paths.bowerLibScripts.map(function(p) {
      return paths.bowerLibScriptsRoot + p;
    })).pipe(concat(paths.libScriptsTarget))
    .pipe(gulp.dest(paths.targetDir))
    .pipe($.size({title: 'libScripts'}));
});

gulp.task('libAssets', ['libAssets:ionicIcons', 'libAssets:fonts', 'libAssets:require']);

gulp.task('libAssets:ionicIcons', function () {
  return gulp.src('./app/lib/ionic/fonts/*.*')
    .pipe(gulp.dest(paths.targetDir+'lib/ionic/fonts'));
});

gulp.task('libAssets:fonts', function() {
  return gulp.src('./app/fonts/*.*')
    .pipe(gulp.dest(paths.targetDir+'fonts'));
});

gulp.task('libAssets:require', function() {
  return gulp.src('./app/lib/*.min.js')
    .pipe(gulp.dest(paths.targetDir+'lib/'));
});

gulp.task('appScripts', function() {
  return gulp.src(paths.appScripts.map(function(p) {
    return paths.appScriptsRoot + p;
  }))
    .pipe(concat(paths.appScriptsTarget))
    .pipe(gulp.dest(paths.targetDir))
    .pipe($.size({title: 'appScripts'}));
});

gulp.task('platform:build', function () {
   return runCommand('ionic build '+buildConfig.platform)();
});

gulp.task('platform:run', function () {
  return runCommand('ionic run '+buildConfig.platform)();
});

gulp.task('platform:emulate', function () {
  return runCommand('ionic emulate '+buildConfig.platform)();
});

/////
// Deploy App
/////

gulp.task('emulate', function () {
  return runSequence(
    'rebuild',
    'platform:build',
    'platform:emulate',
    'logcat'
  );
});

gulp.task('run', function () {
  return runSequence(
    'rebuild',
    'platform:build',
    'platform:run',
    'logcat'
  );
});

gulp.task('logcat', function (cb) {
  if(!buildConfig.debug){
    cb();
    return;
  }
  if(buildConfig.platform !== 'android'){
    gutil.log(gutil.colors.red('don\'t know, how to output the log on '+buildConfig.platform));
    cb();
    return;
  }
  var child = exec('adb logcat -s chromium', [], {cwd: process.cwd()});
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', function(data) {
      gutil.log(data);
  });
  return child;
});

/////
// Quality Assurance
/////

gulp.task('jshint', function() {
  return gulp.src([
      './app/js/**/*.js',
      './gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/////
// Support Functions
/////

function runCommandSequence(commands) {
  var done = Q.defer();
  var commandPromise = null;
  commands.forEach(function(p) {
    if (commandPromise === null) {
      gutil.log(p+' ...');
      commandPromise = runCommand(p)();
    } else {
      commandPromise = commandPromise.then(function () {
        gutil.log(p+' ...');
        return runCommand(p)();
      });
    }
  });
  if (commandPromise === null) {
    done.resolve();
  } else {
    commandPromise.then(function() {
      done.resolve();
    }, function() {
      done.reject();
    });
  }
  return done.promise;
}

function runCommand(cmd) {
  return function() {
    var STDOUT = 0, STDERR=1;
    var output = [];
    var defered = Q.defer();
    var child = exec(cmd, [], {cwd: process.cwd()});
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', function(data) {
      output.push({type:STDOUT, msg: data});
      if(buildConfig.verbose){
        gutil.log(data);
      }
    });
    var printOutput = function () {
      output.forEach(function(m) {
        if(m.type === STDERR){
          gutil.log(gutil.colors.red(m.msg));
        }else{
          gutil.log(m.msg);
        }
      });
    };
    child.stderr.on('data', function(data) {
      output.push({type:STDERR, msg: data});
      if(buildConfig.verbose){
        gutil.log(gutil.colors.red(data));
      }

    });
    child.on('close', function(code) {
      if (code === 0) {
        defered.resolve();
      } else {
        gutil.log(gutil.colors.red('ERROR '+cmd+''));
        printOutput();
        defered.reject();
      }
    });
    child.on('error', function() {
      gutil.log(gutil.colors.red('ERROR running external Command <'+cmd+'>:'));
      gutil.log(gutil.colors.red(arguments));
      gutil.log(gutil.colors.red('Output of Command:\n---------------------------------------\n'));
      printOutput();
      gutil.log(gutil.colors.red('\n---------------------------------------\nEnd of output'));
    });
    return defered.promise;
  };
}
