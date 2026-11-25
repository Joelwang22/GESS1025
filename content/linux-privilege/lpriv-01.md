# LPRIV-01. Establish context and immediate privileges

**Run this when:** you have a new Linux shell, changed users, or cannot yet attribute the shell to the assigned host.

Identity, host and home:

```bash
pwd
ls -la ~
hostname
whoami
id
groups
sudo -n -l
getent group sudo wheel docker lxd disk adm shadow 2>/dev/null
```

If nonblocking sudo says a password is required and you have the current user's supplied password, run `sudo -l` once at its normal prompt. Never place a password in command arguments.

Group records use `name:password-placeholder:GID:members`; `id` remains the reliable view of the current process's supplementary groups.

**Look for:** an unexpected account or host, useful groups, an unrestricted or executable-specific sudo rule, and files already present in the current home.

**If found:** keep the complete sudo rule and go to [LPRIV-03](./lpriv-03). Docker or LXD membership goes to [LPRIV-11](./lpriv-11). A new identity returns here before any other action.

## Confirm the operating-system boundary

Kernel and process boundary:

```bash
uname -srm
head -n 15 /etc/os-release 2>/dev/null
grep -E '^(Uid|Gid|Groups|CapEff|CapBnd|NoNewPrivs|Seccomp|NSpid):' "/proc/$$/status" 2>/dev/null
cat "/proc/$$/cgroup" 2>/dev/null
```

Use the `/proc` checks only when UID 0, container clues, or unexpected execution behavior makes the boundary relevant. A zero UID in a user namespace is not automatically host root.

**Look for:** `NoNewPrivs`, seccomp, remapped IDs, container cgroups, or a kernel and userspace that do not match the expected target.

**If found:** record the boundary and continue at [LPRIV-11](./lpriv-11). Operating-system prerequisites for a specific kernel lead belong at [LPRIV-13](./lpriv-13).

## Recover a restricted shell

Shell and available escape binaries:

```bash
printf 'Shell: %s\nFlags: %s\n' "$0" "$-"
command -v bash vim vi python3 2>/dev/null
# In Vim or Vi, when /bin/bash exists:
# :set shell=/bin/bash
# :shell
```

Verify a recovered shell with `hostname`, `id`, and `pwd`. The editor escape changes the shell boundary, not the user.

**If nothing stands out:** continue to [LPRIV-02](./lpriv-02) and enumerate users and homes.
