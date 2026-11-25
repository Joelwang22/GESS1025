# LPRIV-11. Containers and ACLs

**Run this when:** group membership, cgroups, sockets, or permission results suggest a container boundary or an ACL not shown by mode bits.

Container tools and groups:

```bash
id
command -v docker lxc lxd 2>/dev/null
docker ps 2>/dev/null
lxc list 2>/dev/null
ls -l /var/run/docker.sock 2>/dev/null
cat /proc/$$/cgroup 2>/dev/null
```

**Look for:** Docker or LXD group membership, access to the Docker socket, running containers, remapped IDs, and evidence that current UID 0 is container-only.

**If found:** establish the host boundary before claiming host privilege. A usable Docker or LXD administrative path still needs [LPRIV-14](./lpriv-14) for exact preconditions, verification, and cleanup.

## Confirm namespace and identity boundaries

Namespaces and UID map:

```bash
readlink /proc/$$/ns/user /proc/$$/ns/mnt /proc/$$/ns/pid 2>/dev/null
cat /proc/$$/uid_map 2>/dev/null
grep -E '^(Uid|Gid|CapEff|CapBnd|NoNewPrivs|Seccomp|NSpid):' /proc/$$/status 2>/dev/null
findmnt -T / -o TARGET,SOURCE,FSTYPE,OPTIONS
```

No single cgroup or namespace value universally identifies a container. Record what the process can actually reach. Do not treat namespace root as the assigned host's root.

## Inspect ACLs only on a lead

Path and parent ownership, ACL:

```bash
namei -l -- '<ABSOLUTE_OBSERVED_PATH>'
getfacl -p -- '<ABSOLUTE_OBSERVED_PATH>' 2>/dev/null
getfacl -p -- '<ABSOLUTE_OBSERVED_PARENT>' 2>/dev/null
```

**Look for:** named-user or named-group read, write, or execute access that ordinary mode bits hide, plus default ACLs that affect newly created children.

Avoid recursive ACL dumps. Test the exact operation after reading the path chain. File write, directory search, and file replacement are separate permissions.

**If found:** writable privileged paths route to [LPRIV-06](./lpriv-06). A container-managed service routes to [LPRIV-07](./lpriv-07).

**If nothing stands out:** continue to [LPRIV-12](./lpriv-12).
