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
 - email: huozhi@a.com
work
 - name: mr
 - email: mr@workspace.com
```

> gitswitch add [alias] [name] [email]

```
$ gitswitch add github huozhi huozhi@a.com
```

> gitswitch use [alias]

```
$ cd ~/workspace/yourrepo
$ gitswitch use github

$ cat ./.git/config

[user]
name = huozhi
email = a@mail.com
```

## LICENSE
MIT
