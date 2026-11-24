# LPRIV-02. SUID or capability identity change

**Run this when:** the current identity is an application account, or you need to identify normal users and account-specific files.

```bash
getent passwd
getent passwd | awk -F: '$7 ~ /(bash|sh|zsh)$/ {print $1 ":" $6 ":" $7}'
ls -la /home 2>/dev/null
who
w
last -n 20 2>/dev/null
```

**Look for:** interactive users, active sessions, home directories, service accounts with real shells, and usernames reused by an application.

**If found:** inspect only the matching user's readable files below. Credentials route to [LPRIV-08](./lpriv-08); a changed identity returns to [LPRIV-01](./lpriv-01).

## Inspect readable home material

```bash
find /home -xdev -maxdepth 3 -type f -readable -ls 2>/dev/null
find /home -xdev -maxdepth 3 -type f -readable \
  \( -name '.*history' -o -name '*.conf' -o -name '*.ini' -o -name '.env' -o -name '*.bak' -o -name '*.old' \) \
  -ls 2>/dev/null
```

Do not sweep `/root` or unrelated homes after a denial. Known-file readability and directory listing are different permissions.

**Look for:** shell history, application configuration, backup files, scripts, SSH material, or a file owned by a user whose account is a plausible next step.

**If found:** move to [LPRIV-08](./lpriv-08) for secrets and keys, or [LPRIV-06](./lpriv-06) if a higher-privileged consumer can write or execute the file.

## Locate one known name

Search likely user and application locations before widening to the current filesystem:

```bash
find /home /opt /var/www /srv -xdev -name '<NAME>' -ls 2>/dev/null
find / -xdev -name '<NAME>' -ls 2>/dev/null
```

Start a separate search at another mount only when `findmnt` shows that the lead lives there. Avoid broad content searches when an exact filename or directory already answers the question.

## Start from an application account

```bash
id
pwd
find /var/www /srv /opt -xdev -maxdepth 4 -type f -readable \
  \( -name '.env' -o -name '*config*' -o -name '*.ini' -o -name '*.yml' -o -name '*.yaml' \) \
  -ls 2>/dev/null
ps -u "$(id -u)" -o pid,ppid,cmd --forest
```

For `www-data` and similar accounts, prefer application-owned configuration over a broad filesystem search. A database password may support a normal-user pivot, but it does not prove local account reuse.

**If nothing stands out:** continue to [LPRIV-03](./lpriv-03) and review delegated commands.
