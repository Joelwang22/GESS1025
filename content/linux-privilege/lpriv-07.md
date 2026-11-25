# LPRIV-07. Processes, services, and local ports

**Run this when:** you need to connect a path, executable, or local service to the account that consumes it.

Process tree, full command lines:

```bash
ps -eo user,pid,ppid,lstart,cmd --forest
ps auxww
```

**Look for:** custom root processes, credentials in arguments, unusual parent-child chains, service wrappers, and executables under `/opt`, `/srv`, `/usr/local`, or web roots.

**If found:** writable paths route to [LPRIV-06](./lpriv-06). Nonstandard software routes to [LPRIV-12](./lpriv-12). Recurring commands route to [LPRIV-05](./lpriv-05).

## Attribute one service

One service's unit and user:

```bash
SYSTEMD_PAGER=cat systemctl --type=service --state=running --no-pager --full 2>/dev/null
SYSTEMD_PAGER=cat systemctl show '<SERVICE>.service' --no-pager \
  -p User -p Group -p ExecStart -p FragmentPath -p DropInPaths -p WorkingDirectory -p MainPID
SYSTEMD_PAGER=cat systemctl cat '<SERVICE>.service' --no-pager
```

An unset `User` often means the manager default, but confirm the actual process. Do not restart, reload, enable, or edit a service to test it.

**Look for:** root services running a writable executable or configuration, relative paths, drop-ins, writable working directories, and wrapper scripts that resolve another program.

The retired service-consumer case required `systemctl show`, the exact executable path, `namei`, and a write predicate before treating the path as a lead. Its delegated wrapper case required reviewing the full installed wrapper and the literal relative argument it resolved. Preserve those checks. Never guess `start` or `stop` arguments.

## Inspect local listeners

Listeners and owning processes:

```bash
ss -lntup 2>/dev/null || netstat -lntup 2>/dev/null
```

**Look for:** listeners bound to `127.0.0.1` or `::1`, local databases, management ports, and a PID or program name tied to a privileged service.

Listener's executable and arguments:

```bash
readlink -f '/proc/<PID>/exe'
tr '\0' ' ' < '/proc/<PID>/cmdline'; printf '\n'
namei -l -- '<OBSERVED_EXECUTABLE_OR_CONFIG>'
```

**If found:** credentials and configuration go to [LPRIV-08](./lpriv-08); executable ownership and packages go to [LPRIV-12](./lpriv-12).

**If nothing stands out:** continue to [LPRIV-08](./lpriv-08).
