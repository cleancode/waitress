// Generated on 2013-08-24 using generator-angular 0.4.0
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
	port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
	'use strict';
	return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
	'use strict';
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	// configurable paths
	var yeomanConfig = {
		kitchen: '../frontend/kitchen',
		ordertaker: '../frontend/order-taker',
		frontend: '../frontend',
		dist: 'dist'
	};

	try {
		yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
	} catch (e) {}

	grunt.initConfig({
		yeoman: yeomanConfig,
		watch: {
			compass: {
				files: ['<%= yeoman.ordertaker %>/styles/{,*/}*.{scss,sass}', '<%= yeoman.kitchen %>/styles/{,*/}*.{scss,sass}'],
				tasks: ['compass:server']
			},
			js: {
				files: ['<%= yeoman.ordertaker %>/scripts/{,*/}*.js', '<%= yeoman.kitchen %>/scripts/{,*/}*.js'],
				tasks: ['jshint']
			},
			express: {
				files:  [ '../api/app.js', '../api/lib/*.js'],
				tasks:  [ 'express' ],
				options: {
					nospawn: true,
					livereload: true
				}
			},
			mocha: {
				files:  [ '../api/**/*.js'],
				tasks:  [ 'mochaTest'],
			},						
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= yeoman.ordertaker %>/{,*/}*.html',
					'.tmp/<%= yeoman.ordertaker %>/styles/{,*/}*.css',
					'{.tmp,<%= yeoman.ordertaker %>}/scripts/{,*/}*.js',
					'<%= yeoman.ordertaker %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= yeoman.kitchen %>/{,*/}*.html',
					'.tmp/<%= yeoman.kitchen %>/styles/{,*/}*.css',
					'{.tmp,<%= yeoman.kitchen %>}/scripts/{,*/}*.js',
					'<%= yeoman.kitchen %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},
		compass: {
			options: {
				sassDir: '<%= yeoman.frontend %>',
				cssDir: '.tmp',
				generatedImagesDir: '.tmp/images/generated',
				imagesDir: '<%= yeoman.ordertaker %>/images',
				javascriptsDir: '<%= yeoman.ordertaker %>/scripts',
				fontsDir: '<%= yeoman.ordertaker %>/styles/fonts',
				importPath: 'mounts/bower_components',
				httpImagesPath: '/images',
				httpGeneratedImagesPath: '/images/generated',
				httpFontsPath: '/styles/fonts',
				relativeAssets: false
			},
			dist: {},
			server: {
				options: {
					debugInfo: true
				}
			}
		},

		// express server
		express: {
			mock: {
				options: {
					script: '../api/app.js'
				}
			}
		},

		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['../api/test/**/*.js']
			}
		},	
			
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							lrSnippet,
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'mounts'),
							mountFolder(connect, yeomanConfig.frontend)
						];
					}
				}
			},
			test: {
				options: {
					middleware: function(connect) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'test')
						];
					}
				}
			},
			dist: {
				options: {
					middleware: function(connect) {
						return [
							mountFolder(connect, yeomanConfig.dist)
						];
					}
				}
			}
		},
		open: {
			server: {
				url: 'http://localhost:<%= connect.options.port %>'
			}
		},
		ngtemplates: {
			dist: {
				options: {
					base: '<%= yeoman.ordertaker %>',
					module: 'orderTakerApp',
					concat: '<%= yeoman.dist %>/scripts/scripts.js'
				},
				src: '<%= yeoman.ordertaker %>/views/{,*/}*.html',
				dest: '.tmp/templates.js'
			}
		},		
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				"force": true
			},
			all: [
				'<%= yeoman.ordertaker %>/scripts/{,*/}*.js',
				'Gruntfile.js'
			]
		},
		// not used since Uglify task does concat,
		// but still available if needed
		/*concat: {
			dist: {}
		},*/
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'<%= yeoman.dist %>/styles/fonts/*'
					]
				}
			}
		},
		useminPrepare: {
			html: '<%= yeoman.ordertaker %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				dirs: ['<%= yeoman.dist %>']
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.ordertaker %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.ordertaker %>/images',
					src: '{,*/}*.svg',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		cssmin: {
			// By default, your `index.html` <!-- Usemin Block --> will take care of
			// minification. This option is pre-configured if you do not wish to use
			// Usemin blocks.
			// dist: {
			//   files: {
			//     '<%= yeoman.dist %>/styles/main.css': [
			//       '.tmp/styles/{,*/}*.css',
			//       '<%= yeoman.app %>/styles/{,*/}*.css'
			//     ]
			//   }
			// }
		},
		htmlmin: {
			dist: {
				options: {
			/*removeCommentsFromCDATA: true,
			// https://github.com/yeoman/grunt-usemin/issues/44
			//collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeOptionalTags: true*/
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.ordertaker %>',
					src: ['*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},
		// Put files not handled in other tasks here
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.ordertaker %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/{,*/}*.{gif,webp,svg}',
						'styles/fonts/*',
						'json/*'
					]
				}, {
					expand: true,
					cwd: '.tmp/images',
					dest: '<%= yeoman.dist %>/images',
					src: [
						'generated/*'
					]
				}, {
					expand: true,
					cwd: 'mount/bower_components/jquery-mobile-bower/css/images',
					dest: '<%= yeoman.dist %>/styles/images',
					src: [
						'*.{png,gif}'
					]
				}]
			}
		},
		concurrent: {
			server: [
				'compass:server'
			],
			test: [
				'compass'
			],
			dist: [
				'compass:dist',
				'imagemin',
				'svgmin',
				'htmlmin'
			]
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>/scripts',
					src: '*.js',
					dest: '<%= yeoman.dist %>/scripts'
				}]
			}
		},
		uglify: {
			dist: {
				files: {
					'<%= yeoman.dist %>/scripts/scripts.js': [
						'<%= yeoman.dist %>/scripts/scripts.js'
					]
				}
			}
		}
	});

	grunt.registerTask('server', function(target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'express',
			'concurrent:server',
			'connect:livereload',
			'open',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean:server',
		'concurrent:test',
		'connect:test',
		'karma'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		'ngtemplates',
		'concat',
		'copy:dist',
		'cdnify',
		'ngmin',
		'cssmin',
		'uglify',
		'rev',
		'usemin'
	]);

	grunt.registerTask('default', [
		'jshint',
		'test',
		'build'
	]);
};