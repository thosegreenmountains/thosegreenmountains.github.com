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
      base: {
        src: ['css/base.css'],
        dest: 'css/base.min.css'
      },
      simple: {
        src: ['css/simple.css'],
        dest: 'css/simple.min.css'
      },
      enhanced: {
        src: ['css/enhanced.css'],
        dest: 'css/enhanced.min.css'
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'js/app.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    watch: {
      assets: {
        files: ['js/app.js', '**/*.css'],
        tasks: ['default']
      },
      sass: {
        files: ['**/*.scss'],
        tasks: ['compass']
      }
    },

    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
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
  grunt.registerTask('default', ['jshint', 'concat', 'cssmin', 'uglify']);

};