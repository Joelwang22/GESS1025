# Checklist review against completed labs

Date: 2026-09-11. Checklist: v1.1, 33 items. Branch:
`docs/standalone-oscp-checklist`.

## Conclusion

The supplied labs support the checklist's web/Linux observation structure, but
they do not establish that the whole checklist is effective. Several concrete
gaps remain, including an overbroad server-error instruction introduced in v1.1.
The checklist should not yet be described as fully validated or proven.

All 29 DOCX files received a narrative-text coverage review. Thirteen selected
embedded screenshots from twelve documents were inspected to corroborate narrow
observations. This was not an exhaustive screenshot review or a replay of the
labs. Commands, copied exploit code and long scanner catalogues were outside the
technical-validation scope. No command in a lab was executed, no target contacted,
and no source DOCX modified. The checklist itself was not changed by this review.

Reviewing a completed write-up asks whether the checklist accommodates the
recorded observations. It cannot show whether a learner would discover them
unaided, whether omitted attempts occurred, or whether the reported solution
would reproduce. Hints, hindsight, duplicated tool output and repeated lab types
limit independence. A lab marked for repetition is not counted as an independent
successful validation.

## Reading the evidence record

Lab IDs L01-L29 resolve below to exact filenames under
`reference_external/my_labs`. Paragraph locators use one-based `w:p` order in
`word/document.xml`, including empty/image paragraphs and table paragraphs. They
are not Word page numbers. The local private index preserves source SHA256 and
image relationships in ignored `.cache/oscp-checklist/lab-review`.

T means relevant narrative text was reviewed. V means the listed embedded image
was also inspected. A locator identifies evidence used for the assessment, not
every paragraph present in the document. Sparse notes remain limited evidence.
No target addresses, credentials, proof strings or operational lab solutions are
reproduced here. This is a coverage record, not a walkthrough answer key.

## Labs used

| ID | Exact filename | Evidence reviewed | Coverage contribution and limitation |
| --- | --- | --- | --- |
| L01 | Amaterasu.docx | T p12-38, p60-75; V p14, p37 | Nonstandard web ports, missing-page filtering, normal upload response, configuration-dependent host behavior. A 404 at the root did not describe the whole application. |
| L02 | assertion101 (offsec, aria2c).docx | T p19-51, p91-102; V p28 | Baseline versus changed-input response, including a 500; local permission review. Supports keeping input-dependent errors separate from availability deferral. |
| L03 | Blogger.docx | T p28-54, p108-131 | Nested CMS installation, component observations, application/database context and a suspected dead end. No screenshots inspected. |
| L04 | BTRSys2.1.docx | T p8-19, p37-80 | FTP no-result note, CMS, identity and database context. A short "nothing" note cannot validate the depth of the FTP assessment. |
| L05 | CyberSploit1 (Offsec).docx | T p22-33, p41-71, p103-110 | Public metadata and detailed OS/distribution/architecture context. Supports contextual verification, not blanket version-based conclusions. |
| L06 | Dawn.docx | T p6-12, p25-40; V p10 | Share listing/access, empty directory view and cross-service context. Write tests in the notes were not replayed or adopted as checklist instructions. |
| L07 | dc-1 (offsec).docx | T p15-29, p68-95 | CMS identification, a failed prerequisite, session usability and permission review. Later operational steps are outside this audit. |
| L08 | dc-2.docx | T p29-38, p67-106 | Hostname context, restricted session and changed identity. Notes demonstrate why existing access does not make all host checks usable. |
| L09 | DC-4.docx | T p16-17, p82-91; V p16 | Ambiguous authentication-related redirect and an overlooked local mailbox. A redirect alone does not settle authentication state. |
| L10 | DC-9.docx | T p8-24, p73, p83, p146-150, p278-280, p330; V p7 | Separate TCP/UDP notes, normal search function, changed view after access, unsuccessful work and hidden-file reminder. Screenshot supports HTTP identification, not complete scan coverage. |
| L11 | Election1.docx | T p9-49, p202-215, p254 | Default page, deeper application paths and an unresolved clue. Large copied script/output sections are not independently validated. |
| L12 | Evilbox-one.docx | T p12-26, p43-52, p78 | Empty response, uncertain interpretation and permission context. The write-up's assertion about what an empty page proves must not become checklist fact. |
| L13 | Funbox.docx | T p8-28, p52-66 | Multiple service names, CMS component uncertainty and restricted-session context. Bulk scanner advisory output excluded from validation. |
| L14 | FunboxEasy (Offsec).docx | T p5-20, p60-85 | TCP/UDP distinction, default-page discovery, authenticated view and local file context. Input-manipulation recipes are not validation artifacts. |
| L15 | FunboxEasyEnum.docx | T p12-31, p49-57, p99-105; V p14 | Visible upload/file function, database role scope and explicit backtracking. Notes contain a causal explanation that screenshots selected here do not prove. |
| L16 | FunboxRookie.docx | T p18-29, p54-68 | Switching from exhausted web work to FTP, artifact handling, failed versus usable access. Bulk-download behavior is not recommended by this review. |
| L17 | Gaara.docx | T p10-48, p65-73, p82 | Service identity and local permission review. The shell-prompt shortcut in the narrative is insufficient identity evidence. |
| L18 | Geisha.docx | T p19, p81; V p11 | Multiple HTTP endpoints, discovery results and an access-denied response. Sparse narrative does not support a full host walkthrough. |
| L19 | ICMP.docx | T p16-34, p59-84; V p83 | Relative redirect, visible product context, no-result review and a directory-listing denial. Supports separate permission questions. |
| L20 | Inclusiveness.docx | T p5-20, p29-35, p60-66 | FTP/web observations and cross-service file context, plus privileged-object review. Connections between services require evidence, not port-name assumptions. |
| L21 | InfosecPrep.docx | T p24-45 | Public metadata, encoded material and local permission clue. Brief notes provide only partial context. |
| L22 | Loly.docx | T p46-63, p77-95 | Hostname-dependent view, unavailable authenticated function and host-environment mismatch. Copied code/scanner catalogue not validated. |
| L23 | Moneybox.docx | T p19-44, p78-100 | Web/file-service switching, unusual artifact and identity-context changes. Puzzle-specific processing is outside the checklist's general observation scope. |
| L24 | My-CMSMS (offsec).docx | T p63-81, p125-140; V p67 | Enumeration fatigue with hint use, database TLS failure and hidden-file reminder. The TLS screenshot is not evidence of invalid credentials. |
| L25 | Photographer (offsec).docx | T p25-64, p95-127; V p97 | Exhausted web paths, share enumeration, archive dead end and authenticated application view. Share enumeration does not establish all share permissions. |
| L26 | Potato (Offsec).docx | T p15-36, p89-95 | Cross-service application context, log-view function and delegated-permission observation. Operational bypass details excluded. |
| L27 | SoSimple (Do this again).docx | T p3-21, p55-61; V p17 | Visible application and explicit correction of earlier evidence. Sparse narrative and repeat marker prevent a complete validation claim. |
| L28 | Vegeta1.docx | T p22-36, p44-55; V p28 | Encoded non-text artifact, obsolete external clue and permission observations. CTF-specific external dependencies are not a general OSCP method. |
| L29 | Wpwn (offsec).docx | T p23-37, p57-79 | CMS component/version observation and application configuration context. A long scanner result is not independent confirmation of each listed issue. |

## Coverage of all 33 checklist items

Supported means the reviewed notes contain a relevant observation and the
checklist's core interpretation fits it. It does not mean the whole item, every
outcome or an exam objective passed. Partial means relevant material exists but
instructions, context or corroboration are insufficient. Untested means this
review did not establish a suitable case. Absence in this review is not proof
that the source documents contain no such material in uninspected screenshots.

| Item | Assessment | Lab evidence or missing case |
| --- | --- | --- |
| NET-001 | Partial | L10 L14 distinguish transports; complete coverage, source context and retained command/output are not established for every lab. |
| NET-002 | Supported | L10 p7 image; L17 service text; L18 multiple web endpoints. Service observation remains separate from vulnerability. |
| NET-003 | Partial | L10 p8 and L14 p5 mention UDP; raw UDP state interpretation not visually corroborated. |
| NET-004 | Supported | L16 p18 and L25 p95 switch to another observed service; L24 documents why endless web enumeration causes friction. |
| HTTP-001 | Partial | L02 exposes overbroad server-error advice; L08 L19 L22 support redirect/name context. |
| HTTP-002 | Partial | L03 L11 L29 support nested application/component inspection; explicit component inventory remains weak. |
| HTTP-003 | Partial | L01 p14 shows filtering; L18 p11 includes refusal; L12 includes an empty response. A controlled soft-404 pair remains unverified. |
| HTTP-004 | Partial | L01 p37 and L15 p14 support normal upload/function observation; input-correlated errors need clearer treatment. |
| HTTP-005 | Partial | L09 p16 shows why status/cookie alone is ambiguous; L22 reports different accessible functions. No-account branch not exercised by a reviewed live case. |
| HTTP-006 | Partial | L07 missing prerequisite; L15 backtracking; L24 fatigue. "Relevant course notes" remains an imprecise handoff, not hand-holding. |
| FTP-001 | Partial | L04 L16 L20 L23; selective read/access interpretation fits, but permission and failure context are often brief. |
| SMB-001 | Supported | L06 p10 and L25 p97 visually distinguish share listing from a directory view. Not every permission state tested. |
| SSH-001 | Partial | L08 L16 distinguish restricted/failed/usable contexts. Transport/trust failure variants not comprehensively reviewed. |
| DATA-001 | Untested | No corroborated RPC/NFS export/client-restriction case selected. |
| DNS-001 | Partial | L08 L22 hostname context is relevant, but hosts-file work is not a DNS-server query validation. |
| DATA-002 | Untested | No corroborated SNMP response/access-context case selected. |
| DATA-003 | Partial | L03 L04 L15 L24 support database context; L24 exposes missing TLS/failure-stage guidance. |
| MAIL-001 | Untested | L09 local mailbox observation does not validate SMTP/POP/IMAP protocol guidance. |
| LNX-001 | Partial | L04 identity checklist; L05 build/architecture; L08 restricted session. Output interpretation needs examples and explicit limits. |
| LNX-002 | Partial | L01 mount context and L19 directory permissions reveal omitted distinctions; repeated permission topics do not validate every boundary. |
| LNX-003 | Partial | L06 L13 support scheduled-service/file relationships; hidden files/local mail deserve explicit coverage. |
| LNX-004 | Supported | L05 exact environment inventory and L22 environment mismatch support prerequisite checking and preserving unresolved conditions. No exploit validation claimed. |
| WIN-001 | Untested | No corroborated Windows session/token case selected. |
| WIN-002 | Untested | No corroborated Windows service/task case selected. |
| WIN-003 | Untested | No corroborated Windows application/permission case selected. |
| WIN-004 | Untested | No corroborated Windows objective/gap case selected. |
| AD-001 | Untested | No corroborated domain-context case selected. Lab names beginning DC do not establish Active Directory coverage. |
| AD-002 | Untested | No corroborated directory-object/collection case selected. |
| AD-003 | Untested | No corroborated domain-relationship prerequisite case selected. |
| AD-004 | Untested | Linux identity changes are not AD-context validation. |
| EVID-001 | Partial | Many notes preserve request/result pairs; L02 is a clear example. No complete exam-proof or reporting compliance audit performed. |
| REVIEW-001 | Supported | L15 explicit backtracking and L24 fatigue/hint use demonstrate why unresolved questions and deliberate switching matter. No usability timing measured. |
| EVID-002 | Partial | L27 corrects earlier evidence; final report reproducibility and submission sufficiency not established. |

## Findings before a fresh-lab trial

### R01 Server error guidance can send the reader the wrong way

High priority. HTTP-001 groups 503 with other server errors and recommends a
later availability recheck. L02 records a normal response and a changed-input
500. The appropriate observation is a request-dependent difference, not an
assumption of transient unavailability. Revise the checklist to distinguish the
two and route benign request comparison through HTTP-004. Do not infer a
vulnerability from the error or reconstruct the lab's exploitation sequence.

### R02 Authentication needs an observable result criterion

High priority. L09 questions what a login-related redirect means. Explicitly say
that a redirect or new session cookie alone does not establish authentication
success or failure. Compare the destination and visible identity/access state
using the intended permitted context. Keep uncertain results unresolved.

### R03 Database connection failures need their own interpretation

High priority. L24 p67 visibly fails certificate verification before a usable
database session. DATA-003 does not explain how to distinguish transport/TLS,
authentication and authorization failures. Add the distinction; do not inherit
the write-up's immediate weakening of TLS as a default instruction.

### R04 CMS and nested application guidance is too broad

Medium priority. L03, L11, L22 and L29 involve a specific installation, component
or authenticated feature. HTTP-002 should prompt a compact inventory of observed
installation paths and components, with version/source confidence. A server
banner or copied scanner advisory is not the same as component confirmation.
This can fit within the existing item; it need not create a tree per plugin.

### R05 Linux review needs concrete permission and file-context questions

Medium priority. L19 distinguishes directory visibility from a listing denial;
L01 records an environment condition affecting behavior. L09 and L24 explicitly
describe overlooked local material. Add separate questions for listing, known-file
readability, effective permissions and environmental restrictions, and name
relevant hidden/configuration/local-mail material. Do not add privileged
invocations or prescribe changing permissions to test them.

### R06 Blank output and uploaded-file behavior need careful wording

Medium priority. L12 asserts more about an empty response than that response
alone establishes. L15 contains a causal explanation of upload behavior that
the reviewed screenshot does not validate. The checklist should retain method,
status, content type, body and access context as observations, and avoid guessing
server implementation from a blank page or rendered file.

### R07 Preserve learning gaps without turning hints into normal steps

Medium priority. L24 explicitly needed a hint; L28 relied on an obsolete external
clue; L27 is marked for repetition. Record where outside help was needed during
your next trial, which checklist item was open and what question was unanswered.
Do not insert box-specific answers, external lookup dependencies or CTF puzzle
recipes into the reusable checklist to make retrospective coverage look complete.

## Resolution addendum 2026-09-11

R01-R07 are addressed editorially in checklist v1.2. The original findings and
lab register above remain the record of the v1.1 review. No lab was replayed.

| Finding | Revised items | Editorial acceptance check |
| --- | --- | --- |
| R01 | HTTP-001, HTTP-004 | A working baseline with an input-dependent error leads to a benign request comparison, not an automatic downtime deferral. Unresolved availability retains a bounded revisit. |
| R02 | HTTP-005 | A redirect or cookie alone leaves login outcome unresolved; destination, visible identity and access supply the comparison. |
| R03 | DATA-003 | A TLS error stays distinct from authentication or authorization failure, with no default verification bypass. |
| R04 | HTTP-002 | Nested installations and observed components retain base path and version evidence without promoting banner guesses to facts. |
| R05 | LNX-002, LNX-003 | Listing denial does not settle known-file access; effective identity, environment restrictions, hidden configuration and relevant local mail are explicit. |
| R06 | HTTP-003, HTTP-004 | Blank responses retain their context without an implementation claim; upload acceptance, retrieval and display remain separate observations. |
| R07 | REVIEW-001 | Practice help is optional and records the item and missing question; assisted review is distinct from unaided unfamiliar-lab use. |

Each row was rechecked against the revised prose. These are content acceptance
checks, not measured user outcomes or validation of the write-ups' attack steps.
The new Word edition has 33 checks on 11 visually inspected pages. Source/Word/PDF
text, IDs and page bounds pass verification. Earlier editions and all 29 lab
originals are unchanged. Prospective trials and unrepresented coverage remain open.

## Fresh-lab trial record

For your next unfamiliar lab, record these fields without looking at its solution:

- Lab label, checklist edition and session date.
- Checklist item, observation and chosen next step.
- Whether the next action was clear without coaching.
- Missing prerequisite, confusing wording or unrepresented situation.
- Whether you used a hint or external explanation, and the question it answered.
- What you revisited and whether earlier notes were sufficient to resume.

Keep credentials and target evidence in your protected lab notes; use references
in the trial record. A completed lab is not automatically a checklist pass, and
a blocked lab is not automatically a checklist failure. Assess the guidance at
the decision that caused friction.

## Verification and limits

Read-only extraction covered all 29 packages. Source hashes were checked again
after review. The document register and matrix include all 29 lab IDs and all 33
checklist IDs. Thirteen named image selections were opened directly from embedded
media; document page layout and every screenshot were not reviewed. No OCR pass
was used. Long copied code/output and linked external resources were not validated.
The private extractor's text filtering is a review convenience, not a security
redaction guarantee; its derivatives must stay private and ignored.

No lab files, checklist DOCX, app files, saved records or fixtures were changed.
This report records retrospective evidence and remaining work. It does not claim
policy approval of tools used in the older labs or validate their attack steps.
