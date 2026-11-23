# LPRIV-13. Kernel and operating-system prerequisites

**Run this when:** a specific, independently researched kernel or operating-system technique remains after application, delegation, file, service, and credential checks.

```bash
uname -a
uname -r
cat /etc/os-release 2>/dev/null
cat /etc/issue 2>/dev/null
arch
getconf LONG_BIT 2>/dev/null
```

**Look for:** the exact kernel build, distribution backports, architecture, and userspace width required by one candidate. A version string alone is not proof.

**If found:** collect the candidate's exact prerequisites before [LPRIV-14](./lpriv-14). If any prerequisite is unknown, keep the candidate pending and continue normal enumeration.

## Check build and runtime tools

```bash
command -v gcc cc make python python3 perl 2>/dev/null
gcc --version 2>/dev/null | head -n 1
python3 --version 2>/dev/null
mount | grep -E ' /tmp | /dev/shm ' 2>/dev/null
grep -E '^(NoNewPrivs|Seccomp|CapBnd):' /proc/$$/status 2>/dev/null
```

**Look for:** an available compiler or interpreter, an executable staging location, blocked process features, and payload requirements that match the target rather than Kali.

## Apply an evidence-first gate

```bash
printf 'candidate=%s\nkernel=%s\narch=%s\n' \
  '<CANDIDATE_AND_REFERENCE>' "$(uname -r)" "$(arch)"
test -r '<REQUIRED_KERNEL_CONFIG_OR_SYMBOL_PATH>'; printf 'Required evidence readable: %s\n' "$?"
```

Require a primary advisory or source, an affected range that accounts for backports, the exact configuration or reachable subsystem, architecture support, and a cleanup or reset plan. Compile off-target when possible and hash the transferred file. Do not run a public proof of concept just because `uname` resembles its README.

Kernel paths are last resort because a wrong assumption can crash the lab, corrupt state, or leave less evidence than a user-space path. Prefer a confirmed sudo, SUID, scheduled job, writable service, credential, container-group, or custom-software lead.

**If nothing stands out:** go to [LPRIV-14](./lpriv-14) only if another page already produced a complete path. Otherwise return to [LPRIV-02](./lpriv-02) and revisit the strongest unresolved lead.
