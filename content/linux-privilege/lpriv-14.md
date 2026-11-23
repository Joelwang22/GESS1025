# LPRIV-14. Execute and verify one privilege path

**Run this when:** one earlier page produced a complete technique with an exact executable or path, verified identity, known trigger, and supported cleanup.

```bash
hostname
id
printf 'Technique: %s\nTarget object: %s\nExpected identity: %s\n' \
  '<EXACT_TECHNIQUE>' '<ABSOLUTE_PATH_OR_RULE>' '<EXPECTED_IDENTITY>'
stat -- '<ABSOLUTE_PATH_OR_EXECUTABLE>' 2>/dev/null
sha256sum -- '<ABSOLUTE_FILE_YOU_MAY_CHANGE>' 2>/dev/null
```

Stop unless the current evidence satisfies every precondition from the source page. Record the run-as user, arguments, mount and namespace boundary, consumer or trigger, and what a negative result means. Choose one technique. Do not combine several guesses.

**Look for:** a reversible change, an unused proof path, and a verification command that does not depend on the technique's own output.

## Prepare recovery before state changes

For a file change, preserve bytes and metadata in a private directory. Do not treat a backup as permission to restore.

```bash
mkdir -m 0700 -- '<NEW_PRIVATE_RECOVERY_DIRECTORY>'
cp --preserve=all -- '<ABSOLUTE_FILE_YOU_MAY_CHANGE>' '<NEW_PRIVATE_RECOVERY_DIRECTORY>/original'
getfacl -p -- '<ABSOLUTE_FILE_YOU_MAY_CHANGE>' > '<NEW_PRIVATE_RECOVERY_DIRECTORY>/original.acl' 2>/dev/null || true
sha256sum -- '<ABSOLUTE_FILE_YOU_MAY_CHANGE>' '<NEW_PRIVATE_RECOVERY_DIRECTORY>/original'
```

If the technique creates an absent file, record the parent, confirm the leaf is absent, use noclobber creation, and record inode, mode, owner, and SHA-256. If another actor may write the same object, stop.

## Execute the documented branch once

Return to the page that established the path and run only its matching command block. Sudo and executable escapes live at [LPRIV-03](./lpriv-03), SUID and capabilities at [LPRIV-04](./lpriv-04), scheduled execution at [LPRIV-05](./lpriv-05), writable paths at [LPRIV-06](./lpriv-06), PATH cases at [LPRIV-09](./lpriv-09), and containers at [LPRIV-11](./lpriv-11).

```bash
# In a new shell or after a proof file appears
/usr/bin/id
/bin/hostname
/bin/grep -E '^(Uid|Gid|NoNewPrivs):' /proc/$$/status
/bin/cat /proc/self/uid_map
```

**If found:** the expected numeric identity on the assigned host is verified. Continue to [LPRIV-15](./lpriv-15) after cleanup. A proof file establishes execution, not an interactive shell.

## Restore and close

Exit child shells before restoring their launch path. Restore only when the current object matches the expected changed state. On unexpected bytes, inode, ownership, ACL, or concurrent edits, stop and keep the recovery copy.

```bash
exit 2>/dev/null || true
id
sudo -k 2>/dev/null || true
sha256sum -- '<ABSOLUTE_RESTORED_FILE>' 2>/dev/null
```

Remove only files you created and can still identify. Stop transfer servers and delete transferred binaries after hash and path checks. Do not erase logs or shell history.

**If the path fails:** record the failed prerequisite, restore any changed state, and return to the page that supplied the lead. Change one assumption at a time.
