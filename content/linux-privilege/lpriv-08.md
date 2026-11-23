# LPRIV-08. Credentials, configuration, and SSH keys

**Run this when:** a user, application, process, or service points to readable configuration or account material.

```bash
for f in ~/.bash_history ~/.zsh_history ~/.mysql_history ~/.psql_history; do
  test -r "$f" && printf '\n== %s ==\n' "$f" && sed -n '1,200p' "$f"
done
find /home -xdev -maxdepth 4 -type f -readable -name '.*history' -ls 2>/dev/null
```

**Look for:** passwords, usernames, internal hosts, database commands, private paths, and commands run by another account.

**If found:** a plausible normal-user credential returns to [LPRIV-01](./lpriv-01) after use. A service lead routes to [LPRIV-07](./lpriv-07).

## Find likely configuration and backups

```bash
find /var/www /opt /srv /home -xdev -type f -readable \
  \( -name '*.conf' -o -name '*.config' -o -name '*.ini' -o -name '.env' \
     -o -name '*.yml' -o -name '*.yaml' -o -name '*.bak' -o -name '*.old' \
     -o -name 'wp-config.php' -o -name 'config.php' -o -name 'settings.php' \
     -o -name 'configuration.php' \) \
  -ls 2>/dev/null
```

Search inside one relevant directory, not the whole filesystem:

```bash
grep -RniE 'password|passwd|secret|token|credential|api[_-]?key' '<APPLICATION_DIRECTORY>' 2>/dev/null
```

Keep the source path with every value. A readable secret is a lead, not proof that another service or local account accepts it.

**If found:** local database client access may expose a delegated shell case in [LPRIV-03](./lpriv-03). Writable configuration routes to [LPRIV-06](./lpriv-06).

## Inspect SSH material

```bash
find /home /root /opt /var/www -xdev -type f \
  \( -name 'id_rsa' -o -name 'id_ed25519' -o -name 'authorized_keys' -o -name '*.pem' -o -name '*.key' \) \
  -ls 2>/dev/null
find /home -xdev -type d -name '.ssh' -ls 2>/dev/null
ls -la ~/.ssh 2>/dev/null
sed -n '1,200p' ~/.ssh/authorized_keys 2>/dev/null
sed -n '1,200p' ~/.ssh/known_hosts 2>/dev/null
ssh-keygen -lf '<READABLE_PUBLIC_OR_PRIVATE_KEY>' 2>/dev/null
```

**Look for:** readable private keys, permitted usernames, reused keys, and internal hostnames. Verify the target host key before any SSH login.

**If nothing stands out:** continue to [LPRIV-09](./lpriv-09).
