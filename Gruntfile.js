module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        bump : {
            options : {
                files : ['package.json'],
                updateConfigs : [],
                commit : true,
                commitMessage : 'chore(ver): v%VERSION%',
                commitFiles : ['package.json', 'CHANGELOG.md'],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'chore(ver): v%VERSION%',
                push : true,
                pushTo : 'origin',
                gitDescribeOptions : '--tags --always --abbrev=1 --dirty=-d',
                globalReplace : false,
                prereleaseName : "rc",
                regExp : false
            }
        },
        shell : {
            addChangelog : {
                command : 'git add CHANGELOG.md'
            }
        },
        changelog : {
            options : {
            }
        }
    });

    grunt.registerTask("release", "Release a new version", function(target) {
        if(!target) {
            target = "minor";
        }
        return grunt.task.run("bump-only:" + target, "changelog", "shell:addChangelog", "bump-commit");
    });
}
