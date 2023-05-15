module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        cacheBust: {
            prod_blagodarie: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/blagodarie/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/blagodarie/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },
            prod_genesis: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/genesis/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/genesis/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },
            prod_map: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/map/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/map/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },

            prod_graph: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/graph/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/graph/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },

            prod_auth_telegram: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/graph/auth/telegram/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/graph/auth/telegram/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },

            prod_group_3djs: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './prod/tempo_/group_3djs/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'prod/tempo_/group_3djs/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },

            dev_blagodarie: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './dev/tempo_/blagodarie/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dev/tempo_/blagodarie/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },
            dev_genesis: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './dev/tempo_/genesis/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dev/tempo_/genesis/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            },
            dev_map: {
                options: {
                    assets: ['**/*.js', '**/*.css'],
                    createCopies: false,
                    baseDir: './dev/tempo_/map/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dev/tempo_/map/',
                        src: ['**/index.html']
                    }
                ],
                jsonOutput: false
            }
        }
    });

   grunt.loadNpmTasks('grunt-cache-bust'); 
   grunt.registerTask('default', ['cacheBust']);
};
