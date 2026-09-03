# Data Model: Internal Issue Routing Assistant

Reasoning first — this describes only what the product actually needs,
based on `product-spec.md` and `architecture.md`. No schema syntax, no
actual table/collection definitions, no ORM code. "Faculty" here means
the same thing as "Department" in `product-spec.md` — see that file's
Terminology Note.

---

## Model

### Domain

**Important entities:**

- **Employee** — the person who submits requests. Attributes worth
  noting: identity, and which faculty they belong to (for context, not
  for restricting what they can report).
- **Request** — the central entity. Holds the free-text problem
  description, current status, owner, sensitivity flag, which
  queue it's sitting in (Faculty or Head-of-HR), its resolution type
  once handled (live chat or remote fix), and — only for requests that
  require sign-off (e.g. expense approval) — an **approval state**
  (Pending / Granted / Denied) plus who decided it.
- **Faculty** — a department (IT, Facilities, Finance, etc.). Owns a
  queue of non-sensitive requests and has staff who can review them.
- **Staff Member** — belongs to exactly one Faculty; can claim and
  resolve requests in that Faculty's queue only.
- **Head of HR** — a distinguished singular role, not a regular Staff
  Member. The only actor authorized to view or resolve requests in the
  Head-of-HR queue.
- **Notification** — a record of a message sent to an Employee about a
  Request (exactly two kinds exist today: "Pending" and "Resolved").
- **History Entry** — an append-only record of a Request's state changes,
  kept for audit purposes even after the Request leaves its queue.

**Relationships, cardinality, ownership:**

- An Employee **submits many** Requests; a Request has **exactly one**
  Employee (its submitter).
- A Request is routed to **exactly one** destination: either **one**
  Faculty's queue, or **the** Head-of-HR queue — never both, never
  neither.
- A Faculty **has many** Staff Members; a Staff Member belongs to
  **exactly one** Faculty.
- A Request has **at most one** current owner at a time: either a Staff
  Member (from the routed Faculty) or the Head of HR — never an
  unassigned/ambiguous owner once claimed, and never someone outside the
  authorized queue.
- A Request has **many** Notifications (at least the Pending one; a
  Resolved one once fulfilled) and **many** History Entries (one per
  state change).

### Lifecycle + Rules

**State transitions** (a Request moves through, in order):

`Submitted → (optionally: Clarifying) → Routed → Pending → In Progress → Resolved`

- `Submitted` — text captured, not yet classified.
- `Clarifying` — only entered if Classification isn't confident; loops
  back to classification once the employee answers.
- `Routed` — a destination (Faculty or Head-of-HR) has been decided.
- `Pending` — sitting in its queue, "Delivered and Pending" message sent.
- `In Progress` — a Staff Member or the Head of HR has claimed it and is
  actively resolving (via live chat or remote fix).
- `Resolved` — terminal. Removed from its queue; "Resolved" message sent.

**Invariants:**

- A Request cannot reach `Resolved` without having passed through
  `Pending` first — no skipping straight to resolved.
- A Request's sensitivity flag is decided once, immediately after
  routing, and does not change afterward in this version of the product
  (re-flagging mid-lifecycle is out of scope for now — a candidate future
  rule, not a current one).
- A Request's queue field and its sensitivity flag must always agree: if
  sensitive = true, queue must be Head-of-HR; if sensitive = false, queue
  must be a Faculty. These can never disagree.
- Exactly one Pending notification and, later, exactly one Resolved
  notification exist per Request — never duplicated, never skipped.
- **Approval state applies only to requests that require sign-off** (per
  FR12 in `product-spec.md`, e.g. expense approvals). For requests that
  don't need approval, this field is simply not applicable — it is not a
  fourth universal state every request passes through, and its absence
  does not block the normal status lifecycle above.

**Authorization-sensitive rules:**

- A Request in the Head-of-HR queue is only queryable/visible to the Head
  of HR — not to any Staff Member, Department Admin, or System
  Administrator's content view.
- A Request in a Faculty queue is only queryable/visible to Staff Members
  of that specific Faculty.
- An Employee can only query/view Requests where they are the submitter.

---

## Implementation Input

### Storage

**Relational vs. document reasoning:**

- The core entities (Employee, Request, Faculty, Staff Member) have
  well-defined relationships and fixed shapes — this fits a **relational**
  model naturally (foreign keys: Request → Employee, Request → Faculty
  or Head-of-HR, Staff Member → Faculty).
- History Entries are append-only, grow over time, and are read as a
  sequence rather than joined against — a **document/log-style** store
  (or an append-only table treated the same way) fits better here than
  forcing them into a rigid relational shape.

**Durable vs. derived:**

- **Durable** (must be stored as-is): Request's description text,
  status, owner, sensitivity flag, queue assignment, timestamps of each
  state change, the approval state and decider (when applicable), and
  the Notification records themselves.
- **Derived** (should be computed at query time, not stored): whether a
  Request is "overdue" — this depends on an SLA, which is still an
  Unknown in `product-spec.md`. Storing a derived "overdue" flag risks it
  going stale; computing it from `(now - pending_since_timestamp)` against
  a policy value avoids that.

### Access

Access pattern = a common way the application needs to find or read data.
Model the queries the product actually needs — not hypothetical reporting
forever.

**Important access patterns:**

| Access pattern | Key / fields used |
|---|---|
| Faculty staff view their queue | `faculty_id` + `status` |
| Head of HR views their queue | `queue_type = HeadOfHR` + `status` |
| Employee checks their own requests | `submitter_id` + `status` |
| Full history for a request | `request_id` → events ordered by time |

**Indexes — only where justified:**

- An index on `(faculty_id, status)` is justified: this is the highest-
  frequency query in the system and directly powers the main staff-facing
  screen.
- An index on `(submitter_id)` is justified: every employee will check
  their own requests regularly.
- **No index is justified yet** for the Head-of-HR queue: by design it
  has exactly one authorized viewer and low volume — adding an index here
  would be optimizing a path that was deliberately kept narrow, not
  something the spec asks for.

---

## Done

Another engineer reading this file alone should be able to explain:
what the system remembers (Request, its state, its owner, its history),
how it connects (Employee → Request → Faculty-or-Head-of-HR → Staff/Head
of HR), which rules matter (sensitivity/queue agreement, one-owner-at-a-
time, Pending-before-Resolved), and how real product queries will find it
(by faculty+status, by submitter, by request ID).
