+++
title = "Fuzzing Commands - OSCP|CTF"
description = "Commands to Fuzz during a CTF"
type = ["posts","post"]
tags = [
    "CTF",
    "OSCP"
]
date = "2022-03-19"
categories = [
    "checheatsheet",
    "OSCP"
]
series = ["OSCP"]
[ author ]
  name = "d42kw01f"
+++

> Most useful fuzzing commands!!!
* * *

# WFUZZ

## XSS:
```bash
wfuzz -c -z file,/usr/share/wfuzz/wordlist/Injections/XSS.txt -d "doi=FUZZ" "$URL"
```

## PARAMETERS:
```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt --hc 404 "$URL"
```

## DIRECTORIES:
- normal
```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt --hc 404 "$URL"
```
- lowercase
```bash
wfuzz -c -z /usr/share/seclists/Discovery/Web-Content/raft-large-directories-lowercase.txt --hc 404 "$URL"
```
## FILES:

### check files:
```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-files.txt --hc 404 "$URL"
```
### large words:
```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-words.txt --hc 404 "$URL"
```
### users:
```bash
wfuzz -c -z file,/usr/share/seclists/Usernames/top-usernames-shortlist.txt --hc 404,403 "$URL"
```

# SMTP
## USER ENUM
#### `VRFY`
```bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -t $ IP
```
#### `EXPN`
```
smtp-user-enum -M EXPN -U /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -t $ IP
```
#### `RCPT`
```
smtp-user-enum -M RCPT -U /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -t $ IP
```
#### `EXPN`
```
smtp-user-enum -M EXPN -U /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -t $ IP
```