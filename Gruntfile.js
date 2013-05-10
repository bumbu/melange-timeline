'use strict';

module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      less: {
        files: ['src/styles/{,*/}*.less'],
        tasks: ['less:development']
      },
      development: {
        options: {
          nospawn: true
        },
        files: [
          'app/{,*/}*.html',
          'app/{,*/}*.css',
          'app/{,*/}*.js',
          'app/{,*/}*.{png,jpg,jpeg,gif}'
        ],
        tasks: []
      }
    },
    coffee: {
      production: {
        files: [{
          expand: true,
          cwd: 'src/scripts',
          src: '*.coffee',
          dest: 'app/js',
          ext: '.js'
        }]
      },
      development: {
        options: {
          sourceMap: true
        },
        files: [{
          expand: true,
          cwd: 'src/scripts',
          src: '*.coffee',
          dest: 'app/js',
          ext: '.js'
        }]
      }
    },
    less: {
      development: {
        options: {
          paths: ["src/styles"]
        },
        files: [{
          expand: true,
          cwd: 'src/styles',
          src: '*.build.less',
          dest: 'app/css',
          ext: '.css'
        }]
      },
      production: {
        options: {
          paths: ["src/styles"],
          yuicompress: true
        },
        files: [{
          expand: true,
          cwd: 'src/styles',
          src: '*.build.less',
          dest: 'app/css',
          ext: '.css'
        }]
      }
    },
    clean: {
      production: 'app/js/{,*/}*.map'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-livereload');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks definitions
  grunt.registerTask('watchWithLiveReload', [
    'livereload-start',
    'watch'
  ]);

  grunt.registerTask('server', [
    'less:development',
    'watchWithLiveReload'
  ]);

  grunt.registerTask('test', [
  ]);

  grunt.registerTask('build', [
    'less:production',
    'clean:production'
  ]);

  grunt.registerTask('default', [
    // 'jshint',
    'test',
    'build'
  ]);

};
