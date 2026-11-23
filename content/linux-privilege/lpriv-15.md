# LPRIV-15. Re-enumerate after changing identity

**Run this when:** a shell, `su`, sudo rule, container action, or scheduled path gives you a different effective identity.

```bash
hostname
id
groups
pwd
ls -la ~
sudo -n -l
```

**Look for:** a new UID or GID, new groups, a different home, new sudo rules, and confirmation that the shell is still on the assigned host.

**If found:** choose the exact affected page below. Do not restart the entire checklist by habit.

## Recheck account-specific access

```bash
find ~ -maxdepth 2 -type f -readable -ls 2>/dev/null
for f in ~/.bash_history ~/.zsh_history ~/.ssh/config ~/.gitconfig; do
  test -r "$f" && printf '\n== %s ==\n' "$f" && sed -n '1,160p' "$f"
done
```

**Look for:** credentials, keys, configuration, scripts, and history that were blocked under the prior identity.

**If found:** route to [LPRIV-08](./lpriv-08). A normal-user pivot may expose a new delegated rule at [LPRIV-03](./lpriv-03).

## Recheck changed permission boundaries

```bash
namei -l -- '<PREVIOUSLY_BLOCKED_PATH>' 2>/dev/null
test -r '<PREVIOUSLY_BLOCKED_PATH>'; printf 'Readable: %s\n' "$?"
test -w '<PREVIOUSLY_BLOCKED_PATH>'; printf 'Writable: %s\n' "$?"
getfacl -p -- '<PREVIOUSLY_BLOCKED_PATH>' 2>/dev/null
```

**Look for:** access gained through the new UID, GID, supplementary groups, ACLs, or a different container namespace.

**If found:** writable paths route to [LPRIV-06](./lpriv-06), containers and ACLs to [LPRIV-11](./lpriv-11), and services to [LPRIV-07](./lpriv-07).

## Route intentionally

- New sudo rule or executable escape: [LPRIV-03](./lpriv-03)
- New SUID, SGID, or capability access: [LPRIV-04](./lpriv-04)
- New cron or timer visibility: [LPRIV-05](./lpriv-05)
- New credentials or SSH keys: [LPRIV-08](./lpriv-08)
- New Docker or LXD access: [LPRIV-11](./lpriv-11)
- Verified final privilege path: return to [LPRIV-14](./lpriv-14) for cleanup and evidence

**If nothing changed:** keep the verified identity and return to the strongest unresolved lead. Do not repeat broad searches that produced no evidence under the same permissions.
