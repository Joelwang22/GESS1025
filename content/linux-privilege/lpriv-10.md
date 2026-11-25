# LPRIV-10. Mounts and NFS

**Run this when:** a path sits on an unusual filesystem, mount options may affect execution, or the host exposes NFS.

Mounts and filesystems:

```bash
mount
findmnt
df -hT
cat /etc/fstab 2>/dev/null
```

**Look for:** writable unusual mounts, credentials in `fstab`, network filesystems, removable media, and `nosuid`, `noexec`, or read-only options that change another hypothesis.

**If found:** recheck the exact SUID or capability candidate in [LPRIV-04](./lpriv-04), or the writable path in [LPRIV-06](./lpriv-06).

## Inspect one path's mount

One path's mount and options:

```bash
findmnt -T '<ABSOLUTE_OBSERVED_PATH>' -o TARGET,SOURCE,FSTYPE,OPTIONS
stat -f -c 'filesystem=%T mount-id=%m' -- '<ABSOLUTE_OBSERVED_PATH>' 2>/dev/null
```

Use this after a real `Read-only file system`, `Permission denied`, `noexec`, or `nosuid` symptom. A service may run in a different mount namespace from the login shell. Do not remount a target to make a technique work.

## Review local NFS exports

Exports and options:

```bash
cat /etc/exports 2>/dev/null
exportfs -v 2>/dev/null
```

**Look for:** a writable export, permissive client scope, `no_root_squash`, and an exported path that maps to a useful local directory.

From Kali or another permitted client, confirm the export and protocol version:

Target's export list:

```bash
showmount -e '<TARGET_IP>' 2>/dev/null
rpcinfo -p '<TARGET_IP>' 2>/dev/null
nmap -sV -p111,2049 '<TARGET_IP>'
```

`showmount` can miss NFSv4-only exports. `no_root_squash` matters only with a permitted mount, a writable export, matching path and ownership behavior, and an authorized client context.

**If found:** a file placed for a privileged local consumer routes to [LPRIV-06](./lpriv-06). A custom service using the mount routes to [LPRIV-07](./lpriv-07).

**If nothing stands out:** continue to [LPRIV-11](./lpriv-11).
