module.exports = function (config) {
    config.set({
        basePath: '../../',

        frameworks: ['jasmine', 'commonjs'],

        files: [
            'src/main/webapp/libs/angular/js/angular.js',
            'src/main/webapp/libs/angular-mocks/js/angular-mocks.js',
            'src/main/webapp/js/**/*.js',
            'src/test/unit/**/*.js'
        ],
        exclude: [],

        preprocessors: {
            'src/main/webapp/js/**/*.js': ['commonjs', 'coverage'],
            'src/test/unit/**/*.js': ['commonjs']
        },

        reporters: ['dots', 'progress', 'junit', 'coverage'],
        junitReporter    : {
            outputDir : 'target/reports/surefire'
        },
        coverageReporter : {
            type : 'lcov',
            dir  : 'target/reports/',
            subdir: 'coverage'
        },

        port: 9876,
        colors: false,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        captureTimeout: 20000,
        singleRun: true,
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-commonjs',
            'karma-coverage'
        ]

    });
};