
/* jshint esversion: 5 */

module.exports = function (grunt) {
    'use strict';

    var path = require('path'),
        imageminOptipng = require('imagemin-optipng');

    require('time-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Define all the paths in the project.
        paths: {
            base: './',
            crawler: { base: './crawler/', },
            dist: {
                base: './dist/',
                assets: '<%= paths.dist.base %>assets/',
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
            data: { base: './data/' },
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
                    ['pathmodify', {
                        mods: [
                            /**
                             * Changes the paths of the files to allow for
                             * imports relative to the root of the project, instead
                             * of './././'-style paths (relative to the importing
                             * file).
                             * @param {Object} rec Alias module paths
                             * @return {Object} Real module paths
                             */
                            function (rec) {
                                var alias = {},
                                    prefix = 'app/';

                                if (rec.id.indexOf(prefix) === 0) {
                                    alias.id = path.join(
                                        path.resolve(),
                                        rec.id
                                    );
                                    return alias;
                                }

                                return rec;
                            }
                        ]
                    }]
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
                    '<%= paths.dist.assets %>app.js': ['<%= paths.app.base %>app.js']
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
                        dest: '<%= paths.public.base %>'
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
                },
                files: {
                    '<%= paths.dist.base %>index.html':
                        ['<%= paths.app.templates %>index.pug']
                }
            },
            prod: {
                options: {
                    pretty: false
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
                    '<%= paths.app %>**/*.js',
                ],
                tasks: ['scripts']
            },
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

    grunt.registerTask('styles', ['sass:dev', 'postcss:dev']);

    grunt.registerTask('templates', ['pug:dev']);

    grunt.registerTask('default', ['clean', 'styles', 'scripts', 'templates', 'copy']);

    grunt.registerTask('serve', ['default', 'connect:server', 'watch']);

    // Production ready task.
    grunt.registerTask('prod', ['clean',
        // Styles
        'sass:prod', 'postcss:prod',

        // Scripts
        'jshint:prod', 'browserify:prod',

        // Copy public files
        'copy',

        // Templates
        'pug:prod',

        // Compression
        'htmlmin', 'compress', 'imagemin']);


};
