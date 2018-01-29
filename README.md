Git-Switch - git profile manager
===

## Install

```
npm install -g gitswitch
```

## Usage

> gitswitch ls

```
$ gitswitch ls

github
 - name: huozhi
 - email: huozhi@company.com
work
 - name: mr
 - email: mr@workspace.com
```

> gitswitch add [alias] [name] [email]

```
$ gitswitch add github huozhi huozhi@company.com
```

> gitswitch use [alias]

```
$ cd ~/workspace/your-repo
$ gitswitch use github

$ cat ./.git/config

[user]
name = huozhi
email = huozhi@company.com
```

## LICENSE
MIT
