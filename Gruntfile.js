
/* jshint esversion: 5 */

module.exports = function (grunt) {
    'use strict';

    var imageminOptipng = require('imagemin-optipng');

    require('time-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Define all the paths in the project.
        paths: {
            base: './',
            crawler: { base: './crawler/', },
            bower: './bower_components/',
            dist: {
                base: './dist/',
                assets: '<%= paths.dist.base %>assets/',
                photos: '<%= paths.dist.base %>photos/',
            },
            app: {
                base: './app/',
                collections: '<%= paths.app.base %>collections/',
                models: '<%= paths.app.base %>models/',
                routers: '<%= paths.app.base %>routers/',
                styles: '<%= paths.app.base %>styles/',
                templates: '<%= paths.app.base %>templates/',
                views: '<%= paths.app.base %>views/',
            },
            data: {
                base: './data/',
                photos: '<%= paths.data.base %>photos/'
            },
            public: { base: './public/' },
            tmp: {
                base: './tmp/',
                app: '<%= paths.tmp.base %>app/'
            }
        },

        // JavaScript syntax checking.
        jshint: {
            options: {
                jshintrc: true
            },
            dev: {
                options: {
                    debug: true
                },
                src: [
                    'Gruntfile.js',
                    '<%= paths.crawler.base %>**/*.js',
                    '<%= paths.app.base %>**/*.js'
                ]
            },
            prod: {
                options: {
                    debug: false
                },
                src: '<%= jshint.dev.src %>',
            },
        },

        // Transpile and bundle.
        browserify: {
            options: {
                plugin: [
                    // ['pathmodify', {
                    //     mods: [
                    //         /**
                    //          * Changes the paths of the files to allow for
                    //          * imports relative to the root of the project, instead
                    //          * of './././'-style paths (relative to the importing
                    //          * file).
                    //          * @param {Object} rec Alias module paths
                    //          * @return {Object} Real module paths
                    //          */
                    //         function (rec) {
                    //             var alias = {},
                    //                 prefix = 'app/';

                    //             if (rec.id.indexOf(prefix) === 0) {
                    //                 alias.id = path.join(
                    //                     path.resolve(),
                    //                     rec.id
                    //                 );
                    //                 return alias;
                    //             }

                    //             return rec;
                    //         }
                    //     ]
                    // }]
                ],
            },
            dev: {
                options: {
                    browserifyOptions: { debug: true },
                    transform: [
                        ['babelify', {
                            presets: ['es2015'],
                            sourceMaps: true
                        }]
                    ]
                },
                files: {
                    '<%= paths.dist.assets %>app.js': [
                        '<%= paths.app.base %>app.js',
                    ]
                }
            },
            prod: {
                options: {
                    browserifyOptions: { debug: false },
                    transform: [
                        ['babelify', {
                            presets: ['es2015'],
                            sourceMaps: false
                        }],
                        ['uglifyify', {
                            mangle: {},
                            screwIE8: true,
                            preserveComments: false,
                            compress: {
                                drop_console: true
                            },
                        }]
                    ]
                },
                files: '<%= browserify.dev.files %>'
            }
        },

        uglify: {
            'vendor-dev': {
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true,
                    sourceMap: true
                },
                files: {
                    '<%= paths.dist.assets %>vendor.js': [
                        '<%= paths.bower %>jquery/dist/jquery.js',
                        '<%= paths.bower %>jquery-mousewheel/jquery.mousewheel.js',
                        '<%= paths.bower %>malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js'
                    ]
                }
            },
            'vendor-prod': {
                options: {
                    mangle: {},
                    screwIE8: true,
                    preserveComments: false,
                    compress: {
                        drop_console: true
                    },
                    sourceMap: true,
                },
                files: '<%= uglify.dev.files %>'
            },
        },

        // Cleanup dist files.
        clean: {
            dist: '<%= paths.dist.base %>*',
        },

        // Copy various static files (images, fonts, etc).
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.public.base %>',
                        src: '**',
                        dest: '<%= paths.dist.base %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= paths.data.photos %>',
                        src: '**',
                        dest: '<%= paths.dist.photos %>'
                    },
                ],
            },
        },

        // Styles compilation.
        sass: {
            dev: {
                options: {
                    outputStyle: 'expanded',
                    sourceComments: true,
                    sourceMap: true
                },
                files: {
                    '<%= paths.dist.assets %>app.css':
                        '<%= paths.app.styles %>app.scss'
                }
            },
            prod: {
               options: {
                    outputStyle: 'compressed',
                    sourceMap: true
               },
               files: '<%= sass.dev.files %>'
            }
        },

        // Style prefixes and minification.
        postcss: {
            dev: {
                options: {
                    processors: [
                        require('autoprefixer')({ browsers: '> 1%, last 4 versions' }),
                    ]
                },
                src: [
                    '<%= paths.dist.assets %>app.css'
                ]
            },
            prod: {
                options: {
                    processors: [
                        require('autoprefixer')({ browsers: '> 1%, last 4 versions' }),
                        require('cssnano')({
                            'zindex': false,
                            'mergeIdents': false,
                            'reduceIdents': false
                        })
                    ]
                },
                src: '<%= postcss.dev.src %>'
            }
        },

        // Templates compilation.
        pug: {
            dev: {
                options: {
                    pretty: true,
                    data: function() {
                        var posts = require('./data/posts.json');
                        var answers = require('./data/answers.json');
                        var data = {
                            posts: posts,
                            answers: answers,
                            debug: true
                        };

                        return data;
                    },
                },
                files: {
                    '<%= paths.dist.base %>index.html':
                        ['<%= paths.app.templates %>index.pug']
                }
            },
            prod: {
                options: {
                    pretty: false,
                    data: function() {
                        var posts = require('./data/posts.json');
                        var answers = require('./data/>answers.json');
                        var data = {
                            posts: posts,
                            answers: answers,
                            debug: true
                        };

                        return data;
                    },
                },
                files: '<%= pug.dev.files %>'
            }
        },

        // HTML minification.
        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist.base %>',
                    src: '**/*.html',
                    dest: '<%= paths.dist.base %>'
                }],
            }
        },

        // PNG compression.
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 4,
                    use: [imageminOptipng()]
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist.assets %>',
                    src: ['**/*.png'],
                    dest: '<%= paths.dist.assets %>'
                }]
            }
        },

        // HTML, JS, CSS compression.
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: '<%= paths.dist.base %>',
                src: ['**/*.{js,css,html}'],
                dest: '<%= paths.dist.base %>',
                ext: function (ext) {
                    return ext + '.gz';
                }
            }
        },

        // critical: {
        //     main: {
        //         options: {
        //             base: './',
        //             css: [
        //                 '<%= targets.dist.assets %>main.css'
        //             ],
        //             dimensions: [{
        //                 width: 1920,
        //                 height: 1800
        //             },
        //             {
        //                 width: 1366,
        //                 height: 700
        //             },
        //             {
        //                 width: 500,
        //                 height: 900
        //             }]
        //         },
        //         src: '<%= targets.dist.base %>index.html',
        //         dest: '<%= targets.dist.base %>index.html'
        //     }
        // },

        // Live compilation.
        watch: {
            // Keep an eye on the changing assets and live reload them.
            livereload: {
                options: { livereload: true, },
                files: [
                    '<%= paths.dist.base %>**/*.{js,css,html,png}'
                ]
            },
            scripts: {
                files: [
                    '<%= paths.app.base %>**/*.js',
                ],
                tasks: ['scripts']
            },
            // 'scripts-vendor': {
            //     files: [
            //         '<%= paths.app.base %>**/*.js',
            //     ],
            //     tasks: ['scripts']
            // },
            styles: {
                files: [
                    '<%= paths.app.styles %>**/*.scss',
                ],
                tasks: ['styles']
            },
            templates: {
                files: [
                    '<%= paths.app.templates %>**/*.pug',
                ],
                tasks: ['templates']
            },
            public: {
                files: [
                    '<%= paths.public.base %>**'
                ],
                tasks: ['copy']
            }
        },

        // Dev server.
        connect: {
            server: {
                options: {
                    livereload: true,
                    port: 8000,
                    hostname: '*',
                    base: '<%= paths.dist.base %>'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('scripts', ['jshint:dev', 'browserify:dev']);
    grunt.registerTask('scripts-vendor', ['uglify:vendor-dev']);

    grunt.registerTask('styles', ['sass:dev', 'postcss:dev']);

    grunt.registerTask('templates', ['pug:dev']);

    grunt.registerTask('default', ['clean', 'styles', 'scripts', 'scripts-vendor',
        'templates', 'copy']);

    grunt.registerTask('serve', ['default', 'connect:server', 'watch']);

    // Production ready task.
    grunt.registerTask('prod', ['clean',
        // Styles
        'sass:prod', 'postcss:prod',

        // Scripts
        'jshint:prod', 'browserify:prod', 'uglify:vendor-prod',

        // Copy public files
        'copy',

        // Templates
        'pug:prod',

        // Compression
        'htmlmin', 'compress', 'imagemin']);


};
