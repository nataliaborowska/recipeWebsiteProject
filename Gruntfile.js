module.exports = function(grunt){

	// configure main project settings

	grunt.initConfig({

		//basic settings and info about our pluggins
		pkg: grunt.file.readJSON("package.json"),

		//name of plugin


		//sass

		sass: {
			dist: {
				files: {
					"css/style.css" : "sass/*.scss"
				}
			}
		},

		//uglify js
		uglify: {
			options:{
				manage: false, //means don't change my functions or variables when minifying my js files
				// preserveComments: "all" // to preserve comments
			},
			my_target: {
				files: {
					"js/functions.min.js" : "js/functions.js"
				}
			}
		},

		//cssmin
		cssmin: {
			my_target: {
				files: [{
 					expand: true,
 					cwd: "css/",
 					src: ["*.css", "!*.min.css"],
 					dest: "css/",
 					ext: ".min.css"
				}]
			}
		},

		//pug
		pug: {
			options: {
				pretty: true
			},
			dist: {
				files: {
					"index.html" : "templates/*.pug"
				}
			}
		},
	

		//watch
		watch: {
			sass: {
				files: ["sass/*.scss"],
				tasks: ["sass", "cssmin"]
			},
			uglify: {
				files: ["js/functions.js"],
				tasks: ["uglify"]
			},
			pug: {
				files: ["templates/index.pug"],
				tasks: ["pug"]
			}

		}
		

	});

	//load the plugin

	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-pug");
	grunt.loadNpmTasks("grunt-contrib-watch");
	

	// do the task
	grunt.registerTask("default", ["sass","uglify","cssmin", "pug", "watch"]);

};