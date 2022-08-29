+++
title = "Try This - OSCP|CTF"
description = "Things to do when you get stuck during a CTF"
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

---

> Did you get stuck during a `CTF`? Don't Worry 😌, I must have missed something. Try this!!!
* * *

# No vulnerabilities found?

## General:
- [ ] Do a full nmap.
- [ ] Make sure to check known vulnerabilities with all services.
	- Examples :- `smb`
```bash
nmap --script smb-vuln* -Pn -p 139,445 {IP}
```
- [ ] Try common passwords with servers.
	- Examples:- `admin:admin`, `admin:password`
	- With weblogins,`FTP`, anything
- [ ] Check similar type `HTB` boxes.
	-  [Google](https://google.com)
	-  [`ipsecc`](https://ippsec.rocks).
* * *
## Having troubles with `nmap`
- [ ] Use `-Pn`
- [ ] Try again `filtered` ports

* * *
## Nothing in `HTTP/S`
- [ ] Check `robots.txt`
- [ ] Use a different workdlist with `gobuster`
	- Examples: directory-list-2.3-medium.txt, big.txt
```bash
gobuster dir -u http://banzai.offseclabs.com:8295/ -w /usr/share/wordlists/dirb/common.txt 
```
- [ ] Use `gobuster` with extension:
	- Examples: `-x php`
```bash
gobuster dir -u http://banzai.offseclabs.com:8295/ -w /usr/share/wordlists/dirb/common.txt -x php
```
- [ ] Use `nikto`
- [ ] Pay more attention to the `nmap` output
- [ ] check hidden `dns`
	- Examples:- `portal.offseclabs.local`
```bash
wfuzz -c -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -u http://192.168.90.56:8295 -H "Host: FUZZ.offseclabs.local" --hh 185 | grep -v 1571
```
- [ ] check [oscp-notes](https://fareedfauzi.gitbook.io/oscp-notes/services-enumeration/http-s) website

***

## Stil Nothing?
- [ ] Time to Bruteforce 
	- `mysql, ftp, etc...`
		- common usernames like `root, ftpuser`
	- [hacktrcks](https://book.hacktricks.xyz/generic-methodologies-and-resources/brute-force)
	- [hydra cheetsheat](https://github.com/frizb/Hydra-Cheatsheet)
```bash
hydra -l patrick -P /usr/share/wordlists/rockyou.txt 192.168.161.39 -t 4 ssh
```
- [ ] Use `Cewl`
```bash
cewl example.com -m 5 -w words.txt
```
- [ ] check for default credentials
- [ ] Check for weak credentials with `LEGION` 

* * *
* * *
# Reverse Shell is not comming?
- [ ] Use a well-known port
	- Examples:-`80`,`443`
- [ ] Use `base64` payload
- [ ] If it is windows try `/` with `//`
- [ ] Try `netcat` 🙃
- [ ] Try blind shell
- [ ] If `searchsploit` does not work, use `msfconsole`

## `msfconsole`
- [ ] Use a different payload with `msfvenon`
	- Examples:-`windows/x64/shell_reverse_tcp`, `windows/shell_reverse_tcp`
	- More to [go](https://infinitelogins.com/2020/01/25/msfvenom-reverse-shell-payload-cheatsheet/)
- [ ] Use a different port number
	- remember `wombo` proving grounds



***
## Exploit not working?
- [ ] Check the version numbers
- [ ] Try fucking everything!!!
***
***

# No Escalations
---
### Windows
#### General:
- [ ] Check the main directory and it's permissions 
```powershell
icacls C:\Backup
```
***
### Stored Credentials:
- [ ] Check all config files
	- `wp-config.php`
	- `config.php`
	- `web.conf`
- [ ] Other passwords files
	-  `C:\unattend.xml`
	- `C:\Windows\Panther\Unattend.xml`
	- `C:\Windows\Panther\Unattend\Unattend.xml`
	- `C:\Windows\system32\sysprep.inf`
	- `C:\Windows\system32\sysprep\sysprep.xml`
```bash
findstr /si password *.txt
findstr /si password *.xml
findstr /si password *.ini
```
- [ ] Thrid-Parti Softwares:
	- McCafe
	- VNC
[More...](https://pentestlab.blog/2017/04/19/stored-credentials/)
---
## Linux
- [ ] Check `SUID`
```bash
find / -user root -perm -4000 2>/dev/null
```
- [ ] Try `sudo -l`
- [ ] Check `id_rsa` in `.ssh`
- [ ] Enumerate the file system with `ls -la`

### Files:
- [ ] Check all config files
	- [ ] `wp-config.php`
	- [ ] `config.php`
- [ ] `password.txt`

## SQL Database
- [ ] Check SQL databases if any