module.exports = function( grunt ) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-coffee');
    
  var jshintall = [
        'gruntfile.js', 
        'public/ees/**/*.js',
        '!public/ees/vendor/*',
        '!public/ees/app.dev.js',
        '!public/ees/app.min.js'
      ];

  grunt
    .initConfig({
      pkg: grunt.file.readJSON('package.json'),

      less: {
        dev: {
          options: {
            compress: false,
            clean: false
          },
          files: {
            'public/ees/css/app.css': ['public/ees/css/app.less'],
            'public/panel/css/panel.css': ['public/panel/css/panel.less']
          }
        },
        build: {
          options: {
            compress: true,
            clean: true
          },
          files: {
            'public/ees/css/app.css': ['public/ees/css/app.less'],
            'public/panel/css/panel.css': ['public/panel/css/panel.less']
          }
        }
      },

      jshint: {
        options: {
          jshintrc: true
        },
        all: jshintall
      },

      concat: {
        options: {
          separator: '\n',
        },
        dev: {
          src: [
            'public/ees/app.js',
            'public/ees/controllers/*.controller.js',
            'public/ees/services/*.service.js',
            'public/ees/services/*.factory.js',
            'public/ees/directives/directives.js'
          ],
          dest: 'public/ees/app.dev.js',
        },
      },

      coffee: {
        panel: {
          files: {
            'lib/panel/routes.js': 'lib/panel/src/routes.coffee',
            'public/panel/js/panel.js': [
              'lib/panel/src/app/app.coffee',
              'lib/panel/src/app/directives.coffee',
              'lib/panel/src/app/factory.coffee',
              'lib/panel/src/app/controllers.coffee',
              'lib/panel/src/app/services.coffee',
            ]}
          }
      },

      uglify: {
          options: {
            mangle: false,
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                    '* Copyright (c) <%= grunt.template.today("yyyy") %> El Terrado \n' +
                    '* Available via the MIT license.\n' +
                    '* see: http://opensource.org/licenses/MIT for blueprint.\n' +
                    '*/\n'
          },
          build: {
            src: 'public/ees/app.dev.js',
            dest: 'public/ees/app.min.js'
          }
      },

      watch: {
        less: {
            files: ['public/ees/css/**/*.less', 'public/panel/css/**/*.less'],
            tasks: ['less:dev']
        },
        jshint: {
            files: jshintall,
            tasks: ['jshint']
        },
        concat: {
            files: [ 'public/ees/**/*.js', '!public/ees/app.dev.js', '!public/ees/app.min.js'],
            tasks: ['concat:dev']
        },
        coffee: {
          files: [ 'lib/panel/src/**/*.coffee' ],
          tasks: [ 'coffee' ]
        }
      }
    });

  
  //grunt.registerTask('dev', ['jshint', 'concat:dev', 'less:dev', 'watch']);
  //grunt.registerTask('build', ['jshint', 'concat:dev', 'uglify', 'less:build']);

  grunt.registerTask('dev', ['coffee', 'concat:dev', 'less:dev', 'watch']);
  grunt.registerTask('build', ['coffee', 'concat:dev', 'uglify', 'less:build']);
  grunt.registerTask('default', ['dev']);

};