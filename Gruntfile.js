
module.exports = function (grunt) {
    'use strict';

    let imageminPNG  = require('imagemin-optipng');
    let imageminJPEG = require('imagemin-jpegtran');
    let _            = require('lodash');
    let moment       = require('moment');
    let path         = require('path');
    let settings     = require('./app/settings');
    let posts        = require(path.join(settings.path.data, 'posts.json'));
    let answers      = require(path.join(settings.path.data, 'answers.json'));


    // Split posts into pages.
    let postCount = settings.maxPosts;
    let postPages = [];

    for (let i = 0; i < Math.ceil(posts.length / postCount); i++) {
        postPages.push(posts.slice(i * postCount, (i + 1) * postCount));
    }

    // Generate all the template targets, depending on data.
    function generatePugTargets(id, path, template, data, options={}) {
        let pathSlug = path.replace(/\//, ''),
            devKey = `dev${pathSlug}${id}`,
            prodKey = `prod${pathSlug}${id}`,
            slug = data.slug ? `-${data.slug}` : '',
            distPath = `<%= paths.dist.base %>${path ? path : ''}${id}${slug}.html`,
            templateData = {
                data,
                serializedData: JSON.stringify(data).replace(/<\//g, "<\\/"),
                answers,
                moment,
                options
            };

        return {
            targets: {
                [devKey]: {
                    options: {
                        pretty: true,
                        compileDebug: false,
                        data: _.merge({ options: {
                            debug: true
                        }}, templateData)
                    },
                    files: { [distPath]: template }
                },
                [prodKey]: {
                    options: {
                        pretty: false,
                        compileDebug: false,
                        data: _.merge({ options: {
                            debug: false
                        }}, templateData)
                    },
                    files: `<%= pug.${devKey}.files %>`
                }
            },
            devKey,
            prodKey
        };
    }

    function mergeTargets(...targets) {
        return _.reduce(targets, (result, current) => {
            let { targets, devKey, prodKey } = current;

            _.merge(result.targets, targets);
            result.devTargets.push(`pug:${devKey}`);
            result.prodTargets.push(`pug:${prodKey}`);

            return result;
        }, { targets: {}, devTargets: [], prodTargets: [] });
    }


    let pugTargets = mergeTargets(
        generatePugTargets('index', '', '<%= paths.app.templates %>index.pug', postPages[0]),

        generatePugTargets('ask', '', '<%= paths.app.templates %>ask.pug', answers, {
            hideAnswers: true
        }),

        ...(_.map(posts, (post) => generatePugTargets(
            post.id, 'post/', '<%= paths.app.templates %>post.pug', post))),

        ...(_.map(postPages.slice(1), (page, index) => generatePugTargets(
            index, 'page/', '<%= paths.app.templates %>page.pug', page)))
    );

    require('time-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Define all the paths in the project.
        paths: {
            base: `${settings.path.project}/`,
            bower: '<%= paths.base %>/bower_components/',
            dist: {
                base: `${settings.path.dist}/`,
                assets: '<%= paths.dist.base %>assets/',
                photos: '<%= paths.dist.base %>photos/',
            },
            app: {
                base: `${settings.path.app}/`,
                collections: '<%= paths.app.base %>collections/',
                models: '<%= paths.app.base %>models/',
                routers: '<%= paths.app.base %>routers/',
                styles: '<%= paths.app.base %>styles/',
                templates: '<%= paths.app.base %>templates/',
                views: '<%= paths.app.base %>views/',
            },
            data: {
                base: `${settings.path.data}/`,
                photos: '<%= paths.data.base %>photos/'
            },
            public: { base: '<%= paths.base %>/public/' },
        },

        /** Javascript ********************************************************/

        // Syntax check
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
                        '<%= paths.app.base %>client.js',
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
                        }]
                    ]
                },
                files: '<%= browserify.dev.files %>'
            }
        },

        uglify: {
            main: {
                options: {
                    mangle: {},
                    screwIE8: true,
                    preserveComments: false,
                    compress: {
                        drop_console: true
                    },
                    sourceMap: true,
                },
                files: {
                    '<%= paths.dist.assets %>app.js': [
                        '<%= paths.dist.assets %>app.js'
                    ]
                }
            }
        },


        /** SCSS **************************************************************/

        // Compile the SCSS styles.
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

        // Append browser prefixes and minify.
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


        /** Templates *********************************************************/

        // Pug to HTML.
        pug: pugTargets.targets,


        /** Compression *******************************************************/

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
            png: {
                options: {
                    optimizationLevel: 2,
                    use: [imageminPNG()]
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.dist.base %>',
                        src: ['**/*.png'],
                        dest: '<%= paths.dist.base %>'
                    }
                ]
            },
            jpeg: {
                options: {
                    use: [imageminJPEG()]
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= paths.dist.base %>',
                        src: ['**/*.jpg', '**/*.jpeg'],
                        dest: '<%= paths.dist.base %>'
                    }
                ]
            },
        },

        responsive_images: {
            main: {
                options: {
                    sizes: [{
                        rename: false,
                        width: 660,
                        height: 372,
                        aspectRatio: false,
                    }]
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist.photos %>',
                    src: ['**/*.{jpg,jpeg,png}'],
                    dest: '<%= paths.dist.photos %>small/'
                }]
            }
        },

        image: {
            main: {
                options: {
                    pngquant: true,
                    optipng: false,
                    zopflipng: false,

                    jpegRecompress: true,
                    jpegoptim: false,
                    mozjpeg: false,

                    gifsicle: false,
                    svgo: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist.base %>',
                    src: ['**/*.{jpg,jpeg,png}'],
                    dest: '<%= paths.dist.base %>'
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

        // Inline critical styles.
        critical: {
            options: {
                base: './',
                css: [
                    '<%= paths.dist.assets %>app.css'
                ],
                dimensions: [{
                    width: 1920,
                    height: 1800
                },
                {
                    width: 1366,
                    height: 700
                },
                {
                    width: 500,
                    height: 900
                }]
            },
            index: {
                src: '<%= paths.dist.base %>index.html',
                dest: '<%= paths.dist.base %>index.html'
            }
        },


        /** Miscellaneous *****************************************************/

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

        // Live compilation.
        watch: {
            // Keep an eye on the changing assets and live reload them.
            livereload: {
                options: { livereload: true, },
                files: ['<%= paths.dist.base %>**/*.{js,css,html,png}']
            },
            scripts: {
                files: ['<%= paths.app.base %>**/*.js'],
                tasks: ['scripts']
            },
            styles: {
                files: ['<%= paths.app.styles %>**/*.scss'],
                tasks: ['styles']
            },
            templates: {
                files: ['<%= paths.app.templates %>**/*.pug'],
                tasks: ['templates:dev']
            },
            public: {
                files: ['<%= paths.public.base %>**'],
                tasks: ['copy']
            }
        },

        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: '<%= paths.app.base %>server.js'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    /** Tasks *****************************************************************/

    grunt.registerTask('scripts', ['jshint:dev', 'browserify:dev']);

    grunt.registerTask('styles', ['sass:dev', 'postcss:dev']);

    grunt.registerTask('templates:dev', pugTargets.devTargets);
    grunt.registerTask('templates:prod', pugTargets.prodTargets);

    grunt.registerTask('default', ['clean', 'styles', 'scripts',
        'templates:dev', 'copy', 'responsive_images']);

    grunt.registerTask('serve', ['default', 'express', 'watch']);

    // Production ready task.
    grunt.registerTask('prod', ['clean',
        // Styles
        'sass:prod', 'postcss:prod',

        // Scripts
        'jshint:prod', 'browserify:prod', 'uglify',

        // Copy public files
        'copy', 'responsive_images',

        // Templates
        'templates:prod', 'critical',

        // Compression
        'htmlmin', 'compress', 'image']);

};
