
module.exports = function (grunt) {
    'use strict';

    let _            = require('lodash');
    let moment       = require('moment');
    let path         = require('path');
    let settings     = require('./app/settings');
    let posts        = require(path.join(settings.path.data, 'posts.json'));
    let answers      = require(path.join(settings.path.data, 'answers.json'));
    const sass = require('node-sass');


    // Split posts into pages.
    let postCount = settings.maxPosts;
    let postPages = [];

    for (let i = 0; i < Math.ceil(posts.length / postCount); i++) {
        postPages.push(posts.slice(i * postCount, (i + 1) * postCount));
    }

    /**
     * Generates targets for the pug and watch tasks, depending on the
     * generated data.
     * @param {String} id Identifier of the currently generated page
     * @param {String} path Destination path
     * @param {String} template Path of the template to use
     * @param {Object} data Data for the template
     * @param {Object} options Additional options
     * @return {Object} Set of targets to use
     */
    function generatePugTargets(id, path, template, data={}, options={}) {
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

    /**
     * Merges a list of targets for the Pug tasks.
     * @param {...Object} targets Array of Objects containing tasks for dev and prod templates
     * @return {Array} List of targets
     */
    function mergeTargets(...targets) {
        return _.reduce(targets, (result, current) => {
            let { targets, devKey, prodKey } = current;

            // The Pug targets are objects, just merge them. The ids are unique
            // anyway.
            _.merge(result.targets, targets);

            // The watch targets are simply arrays, push the items in them.
            result.devTargets.push(`pug:${devKey}`);
            result.prodTargets.push(`pug:${prodKey}`);

            return result;
        }, { targets: {}, devTargets: [], prodTargets: [] });
    }

    // Build all the targets.
    let pugTargets = mergeTargets(

        // Single pages, pretty straightforward configuration.
        generatePugTargets('index', '', '<%= paths.app.templates %>index.pug', postPages[0]),
        generatePugTargets('error', '', '<%= paths.app.templates %>error.pug', postPages[0]),
        generatePugTargets('ask', '', '<%= paths.app.templates %>ask.pug', answers, {
            hideAnswers: true
        }),

        // Single post pages. Map posts and generate the targets, then deconstruct with the
        // splat operator the results of the map.
        ...(_.map(posts, (post) => generatePugTargets(
            post.id, 'post/', '<%= paths.app.templates %>post.pug', post))),

        // Post list pages. The posts were sliced into pages earlier, iterate over those
        // and generate the targets with the appropriate path.
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
                            presets: ['@babel/preset-env'],
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
                            presets: ['@babel/preset-env'],
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
                    implementation: sass,
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
                    implementation: sass,
                    outputStyle: 'compressed',
                    sourceMap: false
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

        // Resize images.
        responsive_images: {
            set: {
                options: {
                    sizes: [{
                        rename: false,
                        height: 372,
                    }]
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dist.photos %>set',
                    src: ['**/*.{jpg,jpeg,png}'],
                    dest: '<%= paths.dist.photos %>small/set/'
                }]
            },
            single: {
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
                    cwd: '<%= paths.dist.photos %>single/',
                    src: ['**/*.{jpg,jpeg,png}'],
                    dest: '<%= paths.dist.photos %>small/single/'
                }]
            }
        },

        // Compress images.
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

    grunt.registerTask('resize', ['responsive_images:set', 'responsive_images:single']);

    grunt.registerTask('templates:dev', pugTargets.devTargets);
    grunt.registerTask('templates:prod', pugTargets.prodTargets);

    grunt.registerTask('default', ['clean', 'styles', 'scripts',
        'templates:dev', 'copy', 'resize']);

    grunt.registerTask('serve', ['default', 'express', 'watch']);

    // Production ready task.
    grunt.registerTask('prod', ['clean',
        // Styles
        'sass:prod', 'postcss:prod',

        // Scripts
        'jshint:prod', 'browserify:prod', 'uglify',

        // Copy public files
        'copy', 'resize',

        // Templates
        'templates:prod', 'critical',

        // Compression
        'htmlmin', 'compress', 'image']);

};
