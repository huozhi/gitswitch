#!/usr/bin/env node

var fs = require('fs')
var ini = require('ini')
var path = require('path')
var program = require('commander')

var joinPath = path.join.bind(null, __dirname)
var GITSWITCHRC = path.join(process.env.HOME, '.gitswitchrc')

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
  Object.keys(profiles).forEach(function(alias) {
    var profile = profiles[alias]
    console.log(alias)
    console.log(' -', 'name:', profile.name)
    console.log(' -', 'email:', profile.email)
  })
}

function setUserInRepo(name) {
  var gitConfigPath = joinPath('.git/config')
  var hasGitConfig = fs.existsSync(gitConfigPath)
  if (!hasGitConfig) {
    exitWithError('Your not in a git repository [' + __dirname + ']')
  }
  var record = getGitUserAliases()[name]
  if (!record) {
    exitWithError('Alias [' + name + '] is not specified yet.')
  }
  var config = ini.parse(readFileSync(gitConfigPath))
  config.user = record
  fs.writeFileSync(gitConfigPath, formatConfig(config))
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
