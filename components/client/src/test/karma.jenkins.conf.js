module.exports = function (config) {
    config.set({
        basePath: '../../',

        frameworks: ['jasmine', 'commonjs'],

        files: [
            'src/main/webapp/bower_components/angular/angular.js',
            'src/main/webapp/bower_components/angular-mocks/angular-mocks.js',
            'src/main/webapp/js/**/*.js',
            'src/test/unit/**/*.js'
        ],
        exclude: [],

        preprocessors: {
            'src/main/webapp/js/**/*.js': ['commonjs', 'coverage'],
            'src/test/unit/**/*.js': ['commonjs']
        },

        reporters: ['dots', 'progress', , 'junit', 'coverage'],
        junitReporter    : {
            outputDir : 'target/surefire-reports/'
        },
        coverageReporter : {
            type : 'cobertura',
            dir  : 'target/coverage-reports/'
        },

        port: 9876,
        colors: true,
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