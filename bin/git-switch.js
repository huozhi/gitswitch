#!/usr/bin/env node

var fs = require('fs')
var ini = require('ini')
var path = require('path')
var {exec} = require('child_process')
var program = require('commander')

var joinPath = path.join.bind(null, process.cwd())
var GITSWITCHRC = path.join(process.env.HOME, '.gitswitchrc')

var log = console.log.bind(console, '\x1b[33m\x1b[1mgitswitch\x1b[0m')

program
  .command('ls')
  .description('list all git profiles in ~/.gitswitchrc')
  .action(listProfles)

program
  .command('use [name]')
  .description('git switch user to [name]\'s config')
  .action(setUserInRepo)

program
  .command('add [alias] [name] [email]')
  .description('add alias for a new git profile, add [name] [email]')
  .action(addUser)

program
  .command('override [email] [name] [next email]')
  .description('override git history to replace [old email] with [name] and [next email]')
  .action(overrideHistory)

program.parse(process.argv)

function exitWithError(err) {
  console.error(err)
  process.exit(1)
}

function readFileSync(filepath) {
  return fs.readFileSync(filepath, 'utf-8')
}

function formatConfig(config) {
  return ini.stringify(config, {whitespace: true})
}

function listProfles() {
  var profiles = getGitUserAliases()
  var aliases = Object.keys(profiles)

  if (aliases.length) {
    aliases.forEach(function(alias) {
      var profile = profiles[alias]
      log('\n' + alias, '\n -', 'name:', profile.name, '\n -', 'email:', profile.email)
    })
  } else {
    log('Empty here..')
  }
}

function setUserInRepo(name) {
  var gitConfigPath = joinPath('.git/config')
  var hasGitConfig = fs.existsSync(gitConfigPath)
  if (!hasGitConfig) {
    exitWithError('Your not in a git repository [' + process.cwd() + ']')
  }
  var record = getGitUserAliases()[name]
  if (!record) {
    exitWithError('Alias [' + name + '] is not specified yet.')
  }
  var config = ini.parse(readFileSync(gitConfigPath))
  config.user = record
  fs.writeFileSync(gitConfigPath, formatConfig(config))
  log('Set profile successfully:', '[', config.user.name, '], [', config.user.email, ']')
}

function getGitUserAliases() {
  return fs.existsSync(GITSWITCHRC) ? ini.parse(readFileSync(GITSWITCHRC)) : {}
}

function syncGitUserAliases(config) {
  fs.writeFileSync(GITSWITCHRC, formatConfig(config))
}

function addUser(alias, name, email) {
  var aliasesMap = getGitUserAliases()
  aliasesMap[alias] = {
    name: name,
    email: email,
  }
  syncGitUserAliases(aliasesMap)
}

function overrideHistory(
  oldEmail,
  name,
  email
) {
  exec(`
    git filter-branch --env-filter '

    OLD_EMAIL="${oldEmail}"
    CORRECT_NAME="${name}"
    CORRECT_EMAIL="${email}"

    if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
    then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
    fi
    if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
    then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
    fi
    ' --tag-name-filter cat -- --branches --tags
  `, function(err, stdout, stderr) {
    if (!err) {
      console.log(stdout)
      const followupCommand = `git push --force --tags origin 'refs/heads/*'`
      
      console.log(`use the following command to push your refs to remote:\n\n${followupCommand}`)
    } else {
      console.error(stderr)
    }
  })
}

