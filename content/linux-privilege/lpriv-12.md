# LPRIV-12. Custom software and installed packages

**Run this when:** a process, service, SUID file, or writable path points to nonstandard or version-sensitive software.

```bash
ls -la /opt /usr/local/bin /usr/local/sbin /srv 2>/dev/null
find /opt /usr/local /srv -xdev -maxdepth 3 -type f -ls 2>/dev/null
```

**Look for:** custom binaries, scripts, backups, version files, writable directories, bundled libraries, and service configuration outside package-managed paths.

**If found:** connect it to a live process in [LPRIV-07](./lpriv-07). Writable paths route to [LPRIV-06](./lpriv-06). Relative execution routes to [LPRIV-09](./lpriv-09).

## Map a real executable to its package

```bash
dpkg-query -S '<ABSOLUTE_EXECUTABLE>' 2>/dev/null
rpm -qf '<ABSOLUTE_EXECUTABLE>' 2>/dev/null
apk info --who-owns '<ABSOLUTE_EXECUTABLE>' 2>/dev/null
pacman -Qo '<ABSOLUTE_EXECUTABLE>' 2>/dev/null
```

No package owner is useful evidence that the file is custom. A package name alone does not establish that the running service uses that copy.

## Record only relevant versions

```bash
'<ABSOLUTE_EXECUTABLE>' --version 2>&1 | head -n 5
stat -- '<ABSOLUTE_EXECUTABLE>'
sha256sum -- '<ABSOLUTE_EXECUTABLE>'
ldd '<ABSOLUTE_EXECUTABLE>' 2>/dev/null
```

**Look for:** an unusually old or locally built component running with higher privilege, a writable dependency, an unsafe wrapper, or a version with a specific prerequisite-matched technique.

Do not run a system-wide package inventory unless a lead requires it. Version strings can be patched, wrapped, or unrelated to the running process. Keep the path, process, service, hash, package owner, and configuration together.

**If found:** verify technique prerequisites at [LPRIV-14](./lpriv-14). If the lead depends on the kernel or architecture, go to [LPRIV-13](./lpriv-13).

**If nothing stands out:** continue to [LPRIV-13](./lpriv-13).
