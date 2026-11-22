# OSCP practical observation checklist

## Using the checklist

Version 1.2 | Policy reviewed 11 September 2026

Use this alongside your lab or exam notes to decide what to inspect, understand what the result means, and keep track of unresolved work. Start with the target's observed services. You do not need to complete every page in order.

This edition covers enumeration, manual observations, host and directory-service review, and evidence. It is not an exploit cookbook or a complete exam-solving procedure. It works without Operator Workbench, internet access or AI. Source links are for later reference, not required steps.

### Choose the relevant section

Start with the service or observation you already have; keep unknown network coverage visible. Use Word's navigation pane to jump to HTTP, another service, host review or evidence. Search an item ID to return to a check.

### Mark what actually happened

Keep the observation separate from work status. Observation: what answered, what changed, or what failed, with its context. Status: not tested, unresolved, blocked, deferred, reviewed or not applicable. A tick means reviewed, never solved or vulnerable.

Not tested means no attempt recorded. Unresolved means the question is still open. Blocked names a missing prerequisite. Deferred preserves the last observation and a revisit reason. Reviewed means this question has been addressed, even if nothing useful emerged. Not applicable needs a reason. Reopening work changes its status, not its earlier evidence. Record shared target and access context once and reference it.

### Read examples before using them

Examples use Kali shell syntax unless labeled Windows or target shell. Replace every angle-bracket placeholder, including the brackets. TARGET is one authorized IP, PORT a confirmed port, HOST an observed in-scope hostname, and URL one exact origin or path. Examples are optional; equivalent saved output may already answer the question.

Run requests only within the assigned scope. Do not treat a hostname, redirect, network route or linked system as authorization to test it. Keep passwords out of command history and checklist copies.

### Exam tool boundary

Policy references P1 and P2 appear at the end. Review them before the exam. This edition uses manual observation and narrow discovery; it excludes automated exploitation, spoofing, mass vulnerability scanners and runtime AI assistance. Tool editions and features matter. Compatibility here is an assessment, not official approval. Do not use AI assistance during the exam or reporting period.

## Network coverage

Applies to each assigned target. Port numbers suggest where to look; identify the actual service before choosing a section. Sources S1 S4 S5 S6 and T1; policy P1.

### NET-001 Check what the scan actually covered

If a service or saved response was supplied without scan history, inspect that service now and mark broader coverage unknown. Record whether the source is supplied, manually observed, imported or fictional. Do not relabel it scan-verified or rescan merely to review existing notes.

Review the saved scan command and output. Note TCP versus UDP, ports covered, completion, and where the scan ran. If TCP coverage is missing, a full TCP connect scan is one option:

```text
nmap -sT -p- --reason <TARGET>
```

An open TCP port has a listener. Closed and filtered mean different things; filtered does not prove a service is absent. A short scan is not full coverage. If discovery reports the assigned host down, check connectivity before considering -Pn. That option skips host discovery, not filtering.

Record open ports and coverage gaps. Revisit incomplete results after connectivity or access changes, not after every unrelated finding.

### NET-002 Confirm the services you will inspect

Probe the observed ports, or review equivalent saved service output:

```text
nmap -sV -p <PORTS> <TARGET>
```

PORTS is a comma-separated list such as 80,443. Treat product/version text as a lead, not proof of a vulnerability. A service on an unusual port still belongs in its service section. Use its native response to resolve an ambiguous fingerprint.

Record protocol, product hint, exact endpoint and confidence. If it answers HTTP, go to HTTP-001. A different protocol needs its own relevant section or a documented coverage gap.

### NET-003 Account for UDP separately

If UDP remains untested and the exercise permits discovery, check selected ports based on the target context. For example:

```text
sudo nmap -sU -p 53,161 --reason <TARGET>
```

This checks two UDP ports, not all UDP services. An open|filtered result is unresolved. A protocol response gives stronger evidence than silence. Avoid forcing high packet rates through an unreliable connection.

Record the tested ports and response. Inspect DNS or SNMP only when supported by results. Leave untested UDP coverage visible.

### NET-004 Choose the next unanswered question

Select a reachable service with an observable lead: an application page, named share, domain clue or supplied access context. Answer its first question before launching more tools. If every service is blocked, revisit scan coverage and connection errors.

Record one next question and why it matters. Service count, scan length and number of completed checks do not measure progress toward the exercise objective.

## HTTP 80 443 and other web ports

Applies to one origin at a time: scheme, hostname and port. Sources S1 S2 S6 and T2 T3; policy P1. Start here for both ordinary sites and web administration interfaces.

### HTTP-001 Establish which site is answering

Open the exact endpoint in a browser. Inspect the response body and headers with a GET request when useful:

```text
curl --max-time 15 -i <URL>
```

For a redirect, inspect Location. A path such as /login stays on the current origin; a different scheme, hostname or port changes the origin. Confirm scope before following. The path name does not prove a login form exists. Inspect the destination response, then continue to HTTP-002 if a page loads.

For a TLS or name error, check the hostname and certificate context before disabling verification. For no HTTP response, record the failure stage and return to NET-001 or DNS-001 as relevant. Unopened work is not a timeout. HEAD alone may not represent GET behavior.

For a server error, retain the request and response. If normal input works but changed input fails, compare that behavior in HTTP-004; do not label the site unavailable. If availability is unresolved, respect any retry time or choose one later manual recheck. If unchanged, defer and continue other work. An error alone proves no vulnerability.

If an observed hostname must reach the assigned IP without changing DNS, an example is:

```text
curl --resolve <HOST>:443:<TARGET> -i https://<HOST>/
```

Record the working origin and any name dependency. Working page: continue to HTTP-002. Unresolved connection/name: return to NET-001 or DNS-001.

### HTTP-002 Understand the visible application

Browse the links and normal controls. Note login, search, upload, download, API links and administration pages. Read page source and referenced client scripts for named routes or product clues. Check robots.txt and sitemap.xml once if relevant.

For a CMS or nested application, note its base path, observed components and version evidence. Keep confirmed details separate from banner guesses or scanner advisories. A script's hidden path is a lead, not proof of access. A public login page is not a vulnerability.

Record the few functions and paths worth checking. If the page is only a default site, inspect observed hostname clues and HTTP-003. If it is functional, use HTTP-004 for its inputs and access boundaries.

### HTTP-003 Compare discovered paths with a baseline

Reuse a recorded baseline if its origin, access context and application behavior still match. Otherwise request a clearly nonexistent path and compare its status, redirect, body and approximate length with interesting paths. Inspect linked paths first; bounded directory discovery is optional if they do not answer the question. One comparison can support several checks without becoming several independent tests.

Some applications return 200 for everything. A 401 requires authentication; a 403 indicates refusal, not a bypass opportunity. Neither a 404 nor an empty body proves resource absence. Preserve method, status, content type, body and access context; a blank page does not identify its implementation.

Record only distinct, reproducible responses. New function: HTTP-004. New observed hostname: verify scope, then HTTP-001. No distinct result: defer with the origin and coverage tested; do not automatically expand the wordlist forever.

## HTTP functions and follow up

Continue only for functions actually observed. Work from the normal behavior of one request. Sources S1 S2 S6 and T2; policy P1. These checks identify questions to investigate, not confirmed vulnerabilities.

### HTTP-004 Inspect one function at a time

Use the function normally and inspect its request in browser developer tools or Burp Community's manual tools. Identify method, path, parameters, content type and response. Use benign input to learn which fields affect the result. Change one value at a time.

For search or record views, note what selects the result. For uploads, distinguish acceptance, later retrieval and how the response is displayed. Record status, content type and body; do not infer server execution from acceptance or display. For downloads, note the file identifier. For login, use HTTP-005 without guessing credentials.

A reflected value, error message or accepted upload is an observation, not proof of exploitability. Record the request shape without session secrets, the specific behavior and the remaining question. If access is required, continue to HTTP-005. Otherwise choose the relevant curriculum topic for manual investigation, without marking it confirmed.

### HTTP-005 Distinguish access limits from missing coverage

No permitted account available: record the challenged path and authentication method, mark that resource blocked, and continue public functions through HTTP-002. A Basic challenge is not a form login. Do not block the whole origin or require credential guessing. Revisit when an appropriate authorized account becomes available.

With an explicitly supplied or already authorized account, compare the destination, visible identity and access before and after sign-in. A redirect or new cookie alone proves neither success nor failure. Leave an ambiguous outcome unresolved. Keep account contexts separate and secrets out of copied commands.

An authenticated view may expose additional functions. An error may instead reflect an expired session, missing role or incorrect origin. Neither establishes that the function is absent. Record the exact context used, not the password or cookie.

New function: HTTP-004. Access denied: mark blocked and name the missing prerequisite. Revisit only when the relevant identity, session or permission changes. Do not turn every login page into a compulsory credential-guessing task.

### HTTP-006 Decide whether there is a new lead

Compare the observations with what is already known. Does a new hostname identify another in-scope origin? Does a product clue have an exact version and configuration to verify? Does a file or error reveal a concrete missing prerequisite?

Keep a product advisory as a hypothesis until its affected versions and required conditions match. Do not select a technique from a banner alone. Preserve a reproducible request and response for a meaningful observation.

One unresolved, testable question: pursue that question using your relevant course notes. No new lead: defer this origin and choose another observed service through NET-004. Return here when new context changes a previous result. You do not need to rerun all six HTTP checks.

## File and remote access services

Use only sections matching an observed service. Conventional ports are listed for navigation. Sources S1 S5 S6; policy P1. Access attempts must remain within the exercise's authorization.

### FTP-001 FTP 21 and file visibility

Read the greeting and offered access mode. If anonymous access is offered or the exercise supplies an account, inspect the directory listing through the normal client. Do not upload or modify files just to test whether the server is writable.

Listing a filename does not prove you can read it, and reading a file does not establish write permission. A permission failure is specific to that identity and path.

Record accessible paths, application/name clues and denied locations. Follow a relevant clue to its service section. No access: defer until the access context changes.

### SMB-001 SMB 139 445 and share context

Review share names and access results using the permitted identity. Distinguish an unauthenticated session, guest mapping and an authenticated account. Inspect relevant accessible directories rather than collecting everything.

A listed share is not necessarily readable. A readable share is not necessarily writable. Administrative-looking names do not establish administrative access.

Record identity type, share/path, observed permissions and useful service/domain clues. Revisit the specific blocked share when a relevant authorized identity becomes available. Domain clues lead to AD-001.

### SSH-001 SSH 22 and remote desktop services

Identify the service and its connection requirements. For SSH, inspect the greeting or saved version output. For remote desktop or management services, note the expected identity scope and transport. Use a supplied account only for its intended system and purpose.

A listening endpoint is not proof of usable credentials or authorization. A connection failure may precede authentication, so distinguish transport errors from access denials. Do not weaken local trust settings to silence an unexplained host-key change.

Record the failure stage or verified session context. Existing Linux access leads to LNX-001; existing Windows access leads to WIN-001. Without access, this remains a prerequisite rather than a completed host assessment.

### DATA-001 RPC 111 and NFS 2049

Review the reported RPC services and any exposed export information with a normal client. Check the stated client restrictions and protocol version. Inspect contents only when the assigned context permits access.

An advertised export is not proof your client can mount it. A mount failure does not prove the export is empty. File ownership and effective permissions need separate observation.

Record export, permitted context and the exact result. A relevant application file is a lead for that application's section. Blocked access stays blocked; do not infer contents.

## Naming mail and data services

Use the observed protocol, including services on nonstandard ports. Sources S1 S5 S6; policy P1. Use ordinary read-only clients and a permitted access context.

### DNS-001 DNS 53 and observed names

Query an observed in-scope name against the relevant DNS server when available:

```text
dig @<DNS_SERVER> <HOST> A
```

DNS_SERVER is the authorized server's IP. Record the resolver, record type and answer. An empty A response does not settle other record types; a name lookup failure may be a resolver problem. Names in certificates, redirects or service replies are clues, not new scope.

For an in-scope web hostname, return to HTTP-001. For domain-service context, use AD-001. Revisit failed name-dependent access after correcting the resolver context.

### DATA-002 SNMP UDP 161

Confirm a protocol response before assuming SNMP is available. With a supplied or otherwise authorized read context, inspect system identity and interface/service information relevant to the exercise. Do not guess community strings as a mandatory step.

UDP silence remains ambiguous. A reported interface or route describes the host; it does not prove your workstation can reach that network or that the network is in scope.

Record the returned system/name clues and access context. Return to NET-004 for a reachable service. Revisit only when permission or reachability changes. SNMP is not the RPC/NFS service on ports 111 and 2049.

### DATA-003 Database services

For observed SQL or other database endpoints, identify the engine and its expected authentication context. Common clues include SQL Server 1433, MySQL 3306 and PostgreSQL 5432, but the response is authoritative.

On failure, distinguish name resolution, TCP connection, TLS verification, authentication and authorization. Preserve the exact error and check the stated layer. A TLS failure does not establish invalid credentials; do not disable verification by default or guess credentials.

With authorized access, inspect visible databases, current role and relevant schema metadata. Do not modify records or enable server features. A successful session does not imply unrestricted access.

Record engine, identity scope and accessible metadata. Link a database to a web application only when configuration or other evidence supports it. Otherwise keep the relationship unconfirmed.

### MAIL-001 SMTP and mailbox services

Identify SMTP, POP3 or IMAP and whether the service expects TLS or STARTTLS. Common ports include 25/465/587, 110/995 and 143/993 respectively. Review the service greeting and capabilities through the normal client.

Capability advertisement does not establish relay permission or mailbox access. Do not send messages or attempt user lists simply to fill this item. With supplied mailbox access, inspect only exercise-relevant material.

Record service, name clues and access requirements. Follow a concrete in-scope application or domain clue. Otherwise defer without claiming that mail has been fully assessed.

## Exploit review and initial access

Use these checks after service enumeration identifies one exact candidate. Keep
the review platform-neutral and preserve the service evidence that justified it.

### EXP-001 Review a public exploit before use

Match the exact product, version or build, endpoint, prerequisites, operating-system architecture and process architecture. Read the header and relevant code. Identify offsets, return addresses, egghunter tags, bad characters, payload boundaries and hardcoded callback settings before changing anything.

Keep the downloaded original immutable. Create a separate modified copy with its own hash and provenance, then change only the required component. CPU capability alone does not determine payload architecture. Start the expected listener or observation point before one reviewed trigger.

Record the exploit source, original hash, modified hash, exact change and the evidence supporting every prerequisite. A title or version match does not prove applicability.

### EXP-002 Verify one exploit result

Check the expected session or controlled callback after one trigger. If a session exists, verify its hostname and identity before entering Linux or Windows host observations. If no session exists, check whether the service still responds.

Record delivery, service crash, controlled callback, verified shell, hostname and identity as separate observations. Script output such as sent or done is not proof of code execution. Recover or reset the lab before another attempt after a service crash, and change one assumption only when the observed failure supports it.

Do not route to post-access triage without a verified shell or equivalent authorized session. Preserve a blocked or crashing path without claiming success.

## Linux host observations

Applies after authorized interactive access already exists. This page is a coverage review, not a privilege-escalation recipe. Sources S1 S2 S4 S5 S6; policy P1.

### LNX-001 Establish the actual session context

In the target shell, inspect identity and host information:

```text
id
hostname
uname -a
```

Note effective identity, groups, architecture and whether the session appears containerized or restricted. A hostname alone does not prove you are on the intended target; correlate it with the assigned address and connection evidence.

Record the context. Administrative-looking output from a different container or host is not the exercise objective. Continue with the relevant configuration checks below.

### LNX-002 Review privilege and ownership boundaries

Inspect the permissions and configuration visible to your current user. Cover delegated commands, privileged file attributes, capabilities, relevant group membership and writable application/service paths. Use read-only inspection; do not change ownership or permissions to test a hypothesis.

Separate directory listing, known-file reading, writing and execution permissions. Listing denial does not settle access to a known path. Note the effective identity and observed mount or environment restrictions. A writable file or known binary name alone does not establish a privilege boundary crossing.

Record the exact object, effective permission and missing condition. Use the relevant course material to investigate a supported hypothesis. If inspection is denied, preserve the limitation instead of marking the area clear.

### LNX-003 Review services tasks and local applications

Inspect visible services, scheduled jobs and configuration locations, including relevant hidden configuration and local mail within permitted access. Relate entries to their execution identity and referenced files. Note target-only listeners and application settings relevant to the exercise.

A scheduled entry is not proof that it runs successfully. A loopback listener is not proof it is reachable from your workstation. Sensitive configuration belongs in protected exercise notes, not in this reusable checklist.

Record the one configuration relationship worth verifying. A new local web service returns to HTTP-001 with its actual connection context. Do not silently broaden network scope.

### LNX-004 Review unresolved host coverage

Check whether installed-software details, OS build, file permissions and application context answer the current question. Compare any advisory against exact prerequisites before treating it as relevant. Version text alone may omit distribution fixes or configuration differences.

Record what is observed, what remains a hypothesis and why a check is deferred. Revisit when a new identity or configuration fact changes access. Preserve proof and reporting evidence through EVID-001 when the exercise objective is independently verified.

## Windows host observations

Applies after authorized interactive access already exists. This page is a coverage review, not a privilege-escalation recipe. Sources S1 S2 S4 S5 S6; policy P1.

### WIN-001 Establish identity and token context

In the target's Windows shell, inspect the session:

```text
whoami /all
hostname
systeminfo
```

Distinguish local and domain identity, group membership, enabled privileges and the current token context. Membership in an administrators group does not by itself describe every process's effective access.

Record host, identity scope, OS/build and the current session context. Correlate the host with the assigned target. Do not infer success from an account name or desktop appearance.

### WIN-002 Review services and scheduled tasks

Inspect visible service and task configuration. For a relevant entry, identify the account that runs it, referenced executable/configuration, path quoting and effective file/service permissions. Keep inspection read-only.

An unquoted path alone is not a complete finding. A potentially writable location matters only with the required path, identity and execution conditions. A listed task may be disabled or have conditions not yet met.

Record the exact entry and unresolved prerequisites. Use course notes for the relevant hypothesis rather than running a generic sequence against every service.

### WIN-003 Review application and permission context

Inspect installed application details, relevant configuration and accessible directories. Note which permissions are effective for the current identity. Separate readable material from a confirmed credential or permission relationship.

A configuration value may be obsolete or belong to another service. Store sensitive values only in protected exercise notes. Do not copy them into the reusable checklist or general project documentation.

Record the supported relationship and where it was observed. Domain context leads to AD-001; a local application endpoint leads to its service section. Neither relationship automatically grants access.

### WIN-004 Review host gaps and objective evidence

Check whether OS/build, token, application configuration and permission observations support the next question. Compare relevant advisory prerequisites with the actual system. A version match alone does not establish applicability.

Keep blocked inspection and untested coverage separate from negative results. Revisit specific checks when the identity or token changes. If the required objective is verified, follow EVID-001 rather than assuming that a tool's success message supplies adequate proof.

## Active Directory context and relationships

Applies when domain evidence or an assigned domain context exists. This page organizes observations, not an attack chain. Sources S1 S2 S4 S5 S6; policy P1 P2.

### AD-001 Confirm the domain context

Correlate the supplied domain information with observed DNS, LDAP, Kerberos and SMB responses. Conventional clues include Kerberos 88 and LDAP 389/636. Establish the relevant domain name, controller and the scope of the supplied identity.

Do not treat a DNS suffix alone as proof of domain membership. A failed domain operation may reflect name resolution, time or transport rather than invalid credentials. Check the stage of failure before changing assumptions.

Record the confirmed identity/domain context and unresolved dependencies. Work on those dependencies first. Never assume an observed related domain belongs to the authorized target set.

### AD-002 Review accessible directory information

Using the authorized context, inspect relevant directory objects, group membership and permissions through ordinary directory tooling or an already collected dataset. Focus on information that answers the current access question.

Keep membership, delegated rights and actual access separate. Collection may be incomplete, denied or older than the current context. An absent object or relationship in a dataset is not conclusive evidence that it does not exist.

Record source, collection time and identity alongside useful relationships. Do not mark an entire domain enumerated because one tool returned output.

### AD-003 Validate relationship prerequisites

For a relevant relationship, identify its source principal, destination object, right, scope and required conditions. BloodHound Legacy/CE can help review relationships under the current policy conditions, but a displayed path is a hypothesis rather than a verified result.

Check whether the right is current, the intended identity has it, and any required access or configuration is actually present. This checklist does not supply commands to exercise those rights.

Record the precise unanswered condition and consult the matching course topic. Reject a stale or unsupported relationship without discarding unrelated observations.

### AD-004 Revisit only the context that changed

When a new authorized identity or verified access context becomes available, identify which previously blocked shares, applications or directory checks it could affect. Keep local and domain authentication scopes distinct.

A successful action on one host does not establish access to another. A route or listener does not grant scope. Do not repeat all collection or all service checks automatically.

Record the changed context and the small set of checks worth revisiting. Keep unverified relationships unresolved and preserve objective evidence separately through EVID-001.

## Evidence and reassessment

Use these checks at meaningful findings or when progress stops. Do not make note-taking a compulsory node between every action. Sources S2 S3 S6; policy P1 P2.

### EVID-001 Preserve evidence when the result matters

Optional note pattern: endpoint and access context; request/action; observed response; source or evidence location; conclusion; unresolved question; work status and revisit reason. Reuse shared context. Omit fields that add nothing, and keep secrets out of the note.

Capture the exact target/context, action, relevant output and interpretation while they are available. Keep enough detail to reproduce the finding. Separate observed facts from your explanation and unresolved assumptions.

For exam objectives, follow the current control-panel instructions and official proof requirements. Proof must come from its original location in an interactive target shell; retain the required screenshot with the target IP and submit through the control panel as required. A screenshot of a tool saying success is not a substitute.

Record evidence locations in protected notes. Follow exam restrictions on target-file handling. Do not bulk-download unrelated target data. Review sensitive output before copying it into general notes or reusable examples.

After the assigned objective is independently verified, record the target,
identity, route and evidence location, then stop optional enumeration that
cannot change the required outcome. A completed objective does not erase
untested coverage; keep it in the practice review without extending the live
target work.

### REVIEW-001 Find the reason progress stopped

Read the last useful observation and the last failure. Is the next question blocked by reachability, naming, an identity, a missing condition or incomplete evidence? Is there a distinct untested service or function that would answer it?

Change one assumption or check one overlooked area. Do not repeat the same scan with more aggressive settings unless the earlier result gives a reason. Take a break or switch to a different scoped target when that offers a clearer next question. No fixed time limit fits every case.

Record the blocked question and revisit reason. In practice labs, optionally record any hint or outside explanation, the item ID and what guidance or knowledge was missing. Retry that question on an unfamiliar lab; distinguish assisted review from unaided use. Do not seek outside assistance during an exam. A deferred branch stays visible without becoming the current task.

### EVID-002 Check the record before closing a target

Confirm that the notes identify the correct target, distinguish identities, include important failed attempts and explain the verified result. Check that evidence opens and that the narrative does not rely on remembered steps.

For an exam, recheck P1's current reporting/submission requirements and the target's instructions. Do not treat a completed checklist as proof that every objective or reporting requirement is satisfied. This document does not replace the official submission procedure.

Keep the final status precise: objective verified, partially verified, blocked or unfinished. Preserve unresolved coverage for practice review instead of silently marking it complete.

## Sources and policy references

The structure draws on six references. The actions and interpretations are an original synthesis. Agreement between checklists does not establish a success rate; no pass guarantee is claimed.

S1 | crtvrffnrt OSCP Checklist Cheatsheet 2024
https://github.com/crtvrffnrt/OSCP-Checklist-Cheatsheet2024

S2 | Anshu OSCP Checklist 2026
https://anshu19981.github.io/OscpCheckList2026/

S3 | Jeff OSCP prep checklist
https://github.com/jeffaf/oscp-prep-checklist

S4 | intotheewild OSCP Checklist
https://github.com/intotheewild/OSCP-Checklist

S5 | Local senior OSCP checklist README and source list
S6 | Operator's wip_oscp_checklist.docx

P1 | OffSec exam guide
https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide

P2 | OffSec exam FAQ
https://help.offsec.com/hc/en-us/articles/4412170923924-OSCP-Exam-FAQ

T1 | Nmap port states
https://nmap.org/book/man-port-scanning-basics.html

T2 | HTTP semantics RFC 9110
https://www.rfc-editor.org/rfc/rfc9110.html

T3 | curl manual
https://curl.se/docs/manpage.html

Policy assessment date: 11 September 2026. P1 displayed an update of 20 April 2026; P2 displayed 31 July 2026. Recheck them before your exam. Named tools remain subject to restrictions on their functionality. Manual browser, curl, DNS and native host inspection are compatibility assessments under those rules, not individually endorsed commands.

Keep this edition as a static reference. Lab validation should measure whether the checks reduce missed observations and confusing decisions. It should not infer guaranteed exam performance from a few successful exercises.
