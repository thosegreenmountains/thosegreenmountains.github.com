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
      minify: {
        src: ['css/main.css'],
        dest: 'css/<%= pkg.name %>.min.css'
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
      files: ['js/app.js', 'css/main.css'],
      tasks: ['default']
    }

  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Setup default task
  grunt.registerTask('default', ['jshint', 'concat', 'cssmin', 'uglify']);

};