# Internal-Issue-Handling-Assistant

A standalone internal application that lets any employee describe a
problem in plain language — *"my laptop stopped working,"* *"I have a
problem with a coworker"* — and automatically routes it to the right
department, tracks it from submission through resolution, and keeps
sensitive cases private to the Head of HR.

## The Problem

Employees today ask for help through messy, inconsistent channels
(email, walk-in, random chat messages), and requests routinely get
forgotten, sent to the wrong person, or left with unclear ownership,
status, or approval. The company wants **one system to submit, handle,
and follow** these requests, instead of the current scattered mess.

## How It Works (high level)

1. An employee types their problem into the app's chat box.
2. The system classifies it — routing to the right department if
   confident, or asking a clarifying question first if not.
3. Immediately after routing, a sensitivity check runs. Sensitive
   requests (e.g. interpersonal issues) go into a completely separate
   queue visible only to the **Head of HR** — they never touch the
   normal department queue.
4. The request enters its queue with status "Delivered, Pending," and
   the employee gets an immediate confirmation message.
5. The department staff member (or the Head of HR, for sensitive cases)
   reviews it and resolves it — either via a **live chat** with the
   employee or a **remote fix** applied directly.
6. Once resolved, the request is removed from its queue and the
   employee gets a "Resolved" message. Full history is kept for every
   request, even after it's closed.

## Status: v0.1 — Product Foundation

This repository currently contains the **problem, architecture, and data
reasoning only** — not a working application yet. Specifically:

**Included:**
- A full requirements specification
- An architecture draft (components, trust boundaries, failure handling)
- A data model (entities, lifecycle, storage/access reasoning)
- One real architecture decision, recorded and justified

**Deliberately not yet included** (by design, for this stage):
- No frontend or backend implementation
- No database tables, schemas, or indexes actually built
- No CI/CD or production infrastructure
- No AI features implemented
- No Git branching/PR workflow yet — this is the initial foundation

## Repository Structure

```
README.md                    ← you are here
docs/
  product-spec.md            ← what problem we're solving, for whom, and why
  architecture.md            ← how the system is structured, and why
  data-model.md              ← what the system remembers, and how it's found
  decisions/
    ADR-001.md                ← one real decision, recorded with its trade-off
```

## Reading Order

These four documents build on each other, in this order:

1. **`docs/product-spec.md`** — Start here. Defines the problem, the
   actors involved, functional/non-functional requirements, what's
   explicitly out of scope, and concrete examples of correct vs.
   incorrect behavior.
2. **`docs/architecture.md`** — Takes the spec as input and reasons about
   structure: which components must exist and why, where the system's
   boundary sits, how information flows, and where trust/authorization
   checks matter. Includes a diagram of the full request flow.
3. **`docs/data-model.md`** — Takes the spec *and* the architecture as
   input and defines what the system needs to remember: entities,
   relationships, lifecycle states, invariants, and the access patterns
   that actually justify any future indexing — not hypothetical
   reporting.
4. **`docs/decisions/ADR-001.md`** — One concrete decision made along the
   way (keeping full status history as events, not just an overwritten
   current-status field), with the problem, options considered, and the
   trade-off accepted.

## Key Design Choices Worth Knowing

- **Standalone application** — this is its own dedicated app, not a
  bot/plugin embedded inside an existing chat tool like Slack or Teams.
- **Structurally separate Head-of-HR queue** — sensitive requests aren't
  just access-restricted within a shared queue; they live in an entirely
  separate queue that only the Head of HR can ever see.
- **Two required resolution paths** — every request is resolved via
  either a live chat with the employee or a remote fix, never automated
  resolution.
- **History is append-only** — every status change is recorded as an
  event, in addition to a current-status field, so the system stays
  fully auditable (see ADR-001).

## Open Questions (Unknowns)

A few things are intentionally left open for now — see the Unknowns
section of `docs/product-spec.md` for the full list, including: whether
login integrates with an existing company identity system, whether
notifications go beyond in-app messages, and whether department queues
need formal SLAs.
