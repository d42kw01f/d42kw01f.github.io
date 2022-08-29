+++
title = "Linux Manual PrivEsc - OSCP|CTF"
description = "Commands Manual Privilege Escation in Linux during a CTF"
type = ["posts","post"]
tags = [
    "CTF",
    "OSCP",
    "cmd",
    "Windows",
    "Linux",
    "PrivEsc"
]
date = "2022-03-19"
categories = [
    "checheatsheet",
    "OSCP",
]
series = ["OSCP"]
[ author ]
  name = "d42kw01f"
+++

> Manual Enumeration For Privilege Escalation in Linux

- check for `SUDI` 
```bash
find / -perm -u=s -type f 2>/dev/null
```
```bash
find / -user root -perm /4000 2>/dev/null
```

- check for `GUID`
```bash
find / -perm -u=g -type f 2>/dev/null
```

- check for `Desktops` and `Documents` and `/home/user/`

- check for `.bash_history

- check for mails
```bash
ls -lsa /var/mail
```
```bash
ls -lsa /var/spool/mail
```
 
- check for running process
```bash
ps aux
```

- check for network activities
```bash
netstat -tunlp
```

- check for mounts
```bash
cat /etc/fstab
```

- check in word writable directories:
```bash
cat /tmp/
cat /dev/shm
```

- check `/etc/` - Looking for anything that is not created by `root`
```bash
ls -lsa /etc/
```

- `passwd` file permissions
```bash
ls -lsa /etc/passwd
```
normal output:
```
4 -rw-r--r-- 1 root root 3467 Jul 27 01:48 /etc/passwd
```

- hiddent `.secret` files
```bash
ls -lsa | grep -i '.secret'
```

- check mysql
```bash
mysql -u root -p
```

- check for `.conf` or configuration files
```bash
find / -type f -name '*.conf' 2>/dev/null
```
```bash
find . -type f -name '*.conf' 2>/dev/null
```
```bash
find . -type f -name '*conf*' 2>/dev/null
```
- check for `cron`
```bash
ls -lsa /etc/cron*
```
```bash
crontab -l
```
```bash
crontab -u root -l
```
