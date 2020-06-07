/* Servidor web gulp para desarrollo 
 */
var gulp = require('gulp');
var connect = require('gulp-connect');
var gulpSequence = require('gulp-sequence');
var babel = require('gulp-babel');

gulp.task('serve-connect', function () {
    connect.server({
        port: 9002,
        host: 'localhost'
    });
    // watch no reload change
});


/**/
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var header = require('gulp-header');
var pkg = require('./package.json');
var rename = require('gulp-rename');


var del = require('del');
var jshint = require('gulp-jshint');


var config = {
    filename: 'geventos.js',
    src: ['./src/app/*.js', './src/app/**/*.js',
        './src/**.js', '!./src/node_modules/***/**',
        './src/**/*.js', '!./src/app/views/templates/*.js', '!./src/app/views/templates/*.html'
    ],
    distSrc: ['./dist/**.js', './dist/**/*.js'
    ],
    tempSrc: ['./temp/*.js', './temp/**/*.js',
        './temp/**.js',
        './temp/**/*.js'
    ],
    srcHtml: ['./src/app/views/*.html',
        './src/app/views/**/*.html',
        './src/app/views/***/*.html',
        './src/***/*.html',
        './src/**/*.html',
        '!./src/app/views/templates/*.html',
        '!./src/app/views/templates/**.html',
        '!./src/node_modules/***/**',
        '!./src/app/components/**.html',
        '!./src/app/components/*.html',
        '!./src/app/components/***/*',
        '!.node_modules/***/**',
        '!.counter/*.html'


    ],
    srcDirectives: [
        './src/app/directives/*.html',
        '!.node_modules/*.html',
        './src/app/directives/**/*.html', '!./src/node_modules/***/**'],

    srcIndexHtml: ['src/index.html'],
    srcCss: ['./content/*.css',
        './content/**/*.css',
        './static/css/*.css', '!./src/node_modules/***/**'
    ],
    images: 'media/**/*',
    dest: './dist',
    temp: './temp',
    umd: {},
    banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @author <%= pkg.author %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n')
};


var browserSync = require('browser-sync'),
    reload = browserSync.reload;

// ////////////////////////////////////////////////
// Browser-Sync Tasks
//
// // /////////////////////////////////////////////

gulp.task('serve-browser-sync', function () {
    browserSync({
        port: 9002,
        host: 'localhost',
        server: {
            baseDir: ".src/"
        },
        browser: ["firefox"], // , "chrome"
        uix: {
            port: 3003
        },
        ui: false
    });

    // watch reload change
    //gulp.watch(config.images).on('change', reload);
    gulp.watch(config.srcCss).on('change', reload);
    gulp.watch(config.srcHtml).on('change', reload);
    gulp.watch(config.srcDirectives).on('change', reload);

    gulp.watch(config.src).on('change', reload);


});


// Copy all static images
gulp.task('images', function () {
    return gulp.src(config.images)
        // Pass in options to the task
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(config.dest + '/media'));
});

gulp.task('styles', function () {
    console.log("styles");
    return gulp.src(config.srcCss)
        .pipe(concat('app.css'))
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(gulp.dest(config.dest));
});

gulp.task('scripts-lint', function () {
    return gulp.src(config.src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});


gulp.task('js', [], function () {





    return gulp.src(config.src)
        .pipe(concat(config.filename))
        .pipe(babel({
            "presets": ["env"]
        }))
        .pipe(uglify().on('error', console.error)
        )
        .pipe(uglify({
            mangle: false,
            output: { beautify: true },
            compress: false
        }))
        .pipe(header(config.banner, { pkg: pkg }))
        .pipe(gulp.dest(config.dest));

});

gulp.task('js-min', ['js'], function () {
    console.log("js-min");

});

gulp.task('html', ['directiveshtml'], function () {
    console.log("html");
    return gulp.src(config.srcHtml)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.dest + '/views'));
});

gulp.task('directiveshtml', function () {
    console.log("directiveshtml");
    return gulp.src(config.srcDirectives)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.dest + '/directives'));
});
gulp.task('indexhtml', function () { //TODO
    console.log("indexhtml");
    return gulp.src(config.srcIndexHtml)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.dest));
});


gulp.task('watch', function () {
    //gulp.watch(config.images, ['images']);
    gulp.watch(config.srcCss, ['styles']);
    gulp.watch(config.src, ['js-min']);
    gulp.watch(config.srcHtml, ['html']);
    gulp.watch(config.srcDirectives, ['directiveshtml']);
    //gulp.watch(config.srcIndexHtml, ['indexhtml']);
});

gulp.task('clean', function () {
    return del(config.dest);
});

gulp.task('clean-temp', function () {
    return del(config.temp);
});

gulp.task('replace-local', ['scripts-lint'], function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('app/**')
        .pipe(replaceFilter)
        .pipe(replace('http://erpweb-dev.upeu/eventos-web', 'http://localhost:9002'))

        .pipe(replace('http://erpresources-dev.upeu/eventos-auth', 'http://localhost:7001'))
        .pipe(replace('http://erpresources-dev.upeu/eventos-resources', 'http://localhost:8003'))
        .pipe(replace('LhWEZvJopxyRRgwmrNVZ0LKXFlAexScqmASe0Zub', 'Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3'))
        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('app/'));
});

gulp.task('replace-dev', ['scripts-lint'], function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('app/**')
        .pipe(replaceFilter)
        .pipe(replace('http://localhost:9002', 'http://erpweb-dev.upeu/eventos-web'))

        .pipe(replace('http://localhost:7001', 'http://erpresources-dev.upeu/eventos-auth'))
        .pipe(replace('http://localhost:8003', 'http://erpresources-dev.upeu/eventos-resources'))
        .pipe(replace('Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3', 'LhWEZvJopxyRRgwmrNVZ0LKXFlAexScqmASe0Zub'))
        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('app/'));
});

gulp.task('replace-login', function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('login/**')
        .pipe(replaceFilter)
        .pipe(replace('http://erpweb-dev.upeu/eventos-web', 'http://localhost:9002'))

        .pipe(replace('http://erpresources-dev.upeu/eventos-auth', 'http://localhost:7001'))
        .pipe(replace('http://erpresources-dev.upeu/eventos-resources', 'http://localhost:8003'))
        .pipe(replace('LhWEZvJopxyRRgwmrNVZ0LKXFlAexScqmASe0Zub', 'Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3'))



        .pipe(replace('http://eventos-web.upeu.edu.pe', 'http://localhost:9002'))
        .pipe(replace('https://eventos-auth.upeu.edu.pe', 'http://localhost:7001'))
        .pipe(replace('https://eventos-backend.upeu.edu.pe', 'http://localhost:8003'))
        .pipe(replace('1A4mAWoxuDIz0a4l3frIQs26JTLqBu56VThYgHYP', '5OsKlr6zA9lMidnInCgZaEswBjm7MgMhE91usGuG'))
        .pipe(replace('Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3', '5OsKlr6zA9lMidnInCgZaEswBjm7MgMhE91usGuG'))
        .pipe(replace('u3oYYwcNFxqDHb7frSX7RzD0y0gbByc36LgOWtQ3EBbBLL2aOiAk3xxCVnlx0XYAXwNw7gT1cmSxropEWA9QWYOpLJP63rBIbQ989djIeR3ElBnduAv6L3ey9OAUGgw9', 'tYwmW1eHh0lTUYoSoCp6DFWfbABHAkzdqkxA26enQbo68ktPtm6DjIsVcSehgkBkbd3kGxoesqFrk3HI8nifixjk89tQMzhjsiorNfeXtW84RDSRdwg8md2ULVeUqYKy'))


        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('login/'));
});

gulp.task('replace-login-dev', function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('login/**')
        .pipe(replaceFilter)
        .pipe(replace('http://localhost:9002', 'http://erpweb-dev.upeu/eventos-web'))

        .pipe(replace('http://localhost:7001', 'http://erpresources-dev.upeu/eventos-auth'))
        .pipe(replace('http://localhost:8003', 'http://erpresources-dev.upeu/eventos-resources'))
        .pipe(replace('Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3', 'LhWEZvJopxyRRgwmrNVZ0LKXFlAexScqmASe0Zub'))
        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('login/'));
});

gulp.task('replace-login-prod', function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('login/**')
        .pipe(replaceFilter)
        //.pipe(replace('http://localhost:9002', 'http://eventos-web.upeu.edu.pe'))
        //.pipe(replace('http://localhost:7001', 'https://eventos-auth.upeu.edu.pe'))
        //.pipe(replace('http://localhost:8003', 'https://eventos-backend.upeu.edu.pe'))
        .pipe(replace('j2V7lpC1O4xSbAcKyVmCr4Yj1Qx9gpTHRVmnxm7u', '1A4mAWoxuDIz0a4l3frIQs26JTLqBu56VThYgHYP'))
        .pipe(replace('5OsKlr6zA9lMidnInCgZaEswBjm7MgMhE91usGuG', '1A4mAWoxuDIz0a4l3frIQs26JTLqBu56VThYgHYP'))

        .pipe(replace('tYwmW1eHh0lTUYoSoCp6DFWfbABHAkzdqkxA26enQbo68ktPtm6DjIsVcSehgkBkbd3kGxoesqFrk3HI8nifixjk89tQMzhjsiorNfeXtW84RDSRdwg8md2ULVeUqYKy', 'u3oYYwcNFxqDHb7frSX7RzD0y0gbByc36LgOWtQ3EBbBLL2aOiAk3xxCVnlx0XYAXwNw7gT1cmSxropEWA9QWYOpLJP63rBIbQ989djIeR3ElBnduAv6L3ey9OAUGgw9'))
        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('login/'));
});


gulp.task('replace-prod', ['scripts-lint'], function () {
    var filter = require('gulp-filter');
    var replace = require('gulp-replace');

    var replaceFilter = filter(['**/*.{js,css,html}', '!src/node_modules/**', '!src/bower_component/**', '!src/components/**/*angular*.*'], { restore: true });

    return gulp.src('dist/**')
        .pipe(replaceFilter)
        .pipe(replace('http://localhost:9002', 'https://eventos-web.upeu.edu.pe'))
        .pipe(replace('http://localhost:7001', 'https://eventos-auth.upeu.edu.pe'))
        .pipe(replace('http://localhost:8003', 'https://eventos-backend.upeu.edu.pe'))
        .pipe(replace('Q5dzu0INVq74WhMrss5xVYDtRrMmF35a7sJoTPe3', 'LhWEZvJopxyRRgwmrNVZ0LKXFlAexScqmASe0Zub'))
        .pipe(replaceFilter.restore)
        .pipe(gulp.dest('dist/'));


});

gulp.task('build-dev', gulpSequence(['js-min', 'styles', 'html'], 'replace-dev', 'replace-login-dev'));
gulp.task('build-prod', gulpSequence(['js-min', 'styles', 'html'], 'replace-prod', 'replace-login-prod'));
gulp.task('build', gulpSequence(['js-min', 'styles', 'html'], 'replace-local', 'replace-login'));
gulp.task('serve', ['serve-connect']);
gulp.task('default', ['serve-browser-sync', 'watch']);
