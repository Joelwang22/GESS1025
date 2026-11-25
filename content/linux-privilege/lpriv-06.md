# LPRIV-06. Writable files and privileged paths

**Run this when:** you need to find files your account can change, or a lead names an exact privileged path.

High-value files and writable config:

```bash
ls -la /etc/passwd /etc/shadow /etc/group /etc/sudoers /etc/crontab 2>/dev/null
find /etc /opt /usr/local /var/www /srv -xdev -type f -writable -ls 2>/dev/null
find /etc/sudoers.d -maxdepth 1 -type f -ls 2>/dev/null
```

**Look for:** scripts, configuration, unit files, sudoers fragments, service executables, and writable parents consumed by a higher-privileged process.

**If found:** establish the consumer in [LPRIV-07](./lpriv-07). Scheduled consumers route to [LPRIV-05](./lpriv-05). A writable account file (`/etc/passwd`, `/etc/group`) routes to [LPRIV-19](./lpriv-19). Do not edit a file based on writability alone.

## Widen only when needed

Whole filesystem, files and directories:

```bash
find / -xdev -type f -writable -ls 2>/dev/null
find / -xdev -type d -writable -ls 2>/dev/null
```

Separate existing-file writes from replacement. Replacing a file depends on write and search permission on its parent, not just the file mode.

Path components, then read/write tests:

```bash
namei -l -- '<ABSOLUTE_OBSERVED_PATH>'
test -r '<ABSOLUTE_OBSERVED_PATH>'; printf 'Readable: %s\n' "$?"
test -w '<ABSOLUTE_OBSERVED_PATH>'; printf 'Writable: %s\n' "$?"
test -w '<ABSOLUTE_PARENT>' && test -x '<ABSOLUTE_PARENT>'; printf 'Replaceable parent: %s\n' "$?"
```

**Look for:** a regular file whose current inode and bytes can be backed up, or an absent leaf beneath a trusted writable parent. A failed predicate is not a privilege result.

## Treat account files as a recovery operation

The retired delegated-append case supported a reversible `/etc/passwd` change only on a disposable lab with explicit permission, a kept-open session, no concurrent account manager, a tested out-of-band root console or VM reset, and a reviewed helper that prepared, verified, and restored exact bytes. It covered both a two-file append program and a NOPASSWD stdin append form. Omitting an append flag could overwrite the account file.

Account files' hash and owner:

```bash
stat -- /etc/passwd '<ABSOLUTE_ALLOWED_APPEND_PROGRAM>'
sha256sum -- /etc/passwd '<ABSOLUTE_ALLOWED_APPEND_PROGRAM>'
getent passwd '<FRESH_LAB_ACCOUNT>'; printf 'Name lookup exit: %s\n' "$?"
```

Do not proceed without the original hash, recovery copy, exact installed-program behavior, and preselected recovery. A backup does not grant restore rights. Route a fully satisfied, authorized case through [LPRIV-14](./lpriv-14); otherwise choose another lead.

**If nothing stands out:** continue to [LPRIV-07](./lpriv-07).
