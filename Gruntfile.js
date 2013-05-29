/*global require, module*/

(function() {

  "use strict";

  var path = require('path');
  var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

  var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
  };

  module.exports = function( grunt ) {

    // Grunt config
    grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),
      concat: {
        options: {
          separator: ';'
        },
        dist: {
          src: ['js/zepto.js', 'js/app.js'],
          dest: 'js/dist/<%= pkg.name %>.js'
        }
      },

      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        dist: {
          files: {
            'js/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
          }
        }
      },

      cssmin: {
        'css/app.min.css': ['css/app.css']
      },

      jshint: {
        files: ['Gruntfile.js', 'js/app.js'],
        options: {
          globals: {
            jQuery: true
          }
        }
      },

      compass: {
        dist: {
          options: {
            config: 'config.rb'
          }
        }
      },

      watch: {
        css: {
          files: ['**/*.css'],
          tasks: ['cssmin']
        },
        js: {
          files: ['js/app.js'],
          tasks: ['jshint', 'concat', 'uglify']
        },
        sass: {
          files: ['**/*.scss'],
          tasks: ['compass']
        }
      }

    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compass');

    // Setup default task
    grunt.registerTask('default', ['watch']);

  };

}());