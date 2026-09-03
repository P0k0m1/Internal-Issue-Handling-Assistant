# Product Spec: Internal Issue Routing Assistant (Standalone Application)

## Scope Note

This document is a **specification draft only** — no implementation yet.

Deliberately **not** included at this stage:
- Frontend code
- Backend code
- Database table design
- API design
- AI features
- Architecture diagrams
- Git repository (setup happens later)

These will be addressed in future assignments, not because they're out of
scope for the project, but because this stage is scoped to defining the
problem and requirements before any design or implementation begins.

## Terminology Note

"Faculty" and "Department" are used interchangeably throughout this
project's docs to mean the same thing: an internal team a request is
routed to (IT, HR, Facilities, Finance, etc.). Role titles like
"Department Admin" refer to the admin of a given faculty/department.

## Problem / Context

**The situation today:** Employees ask for help through messy, inconsistent
channels. Real examples of how requests currently show up:
- "My laptop has a problem."
- "I need access to a software system."
- "I need an employment letter."
- "I need approval for a work expense."

**The pain this causes:**
- Requests get forgotten
- Requests get sent to the wrong person
- Ownership of a request is unclear (who's actually responsible for it?)
- Status is unclear (is it even being worked on?)
- Approval is unclear (who needs to approve it, and have they?)

Employees at the company frequently run into problems that need help from a
specific internal team or department — IT, HR, Facilities, Finance, Security,
etc. Today, employees often don't know:
- Who exactly to contact for a given problem
- Which channel or ticketing system to use
- Whether their issue is even the "right" category (e.g. is a login issue IT
  or Security?)

This causes delays, misrouted requests, duplicate tickets, and frustration on
both sides — employees waste time finding the right contact, and support
teams waste time redirecting misrouted requests.

**The company wants one system to submit, handle, and follow these
requests.** We want a **standalone application** — its own dedicated app,
not built on top of or embedded into any existing chat tool or intranet —
where an employee describes their problem in plain, everyday language
(e.g. "my laptop stopped working" or "I have a problem with a coworker"),
and the system:
1. Automatically identifies the right department/person and connects the
   employee to them (routing), and
2. Lets the request be tracked from submission through resolution, so
   ownership, status, and approval are never unclear.

## Known Facts

- The company has distinct internal support functions today (e.g. IT
  Helpdesk, HR, Facilities), each currently reached through different,
  inconsistent channels (email, ticket portal, walk-in, Slack/Teams
  channels, etc.)
- Employees currently use a mix of tools (email, chat apps, walk-in) to
  request help, but there is no single dedicated tool for this today — this
  system is meant to be that dedicated tool, standalone from those channels.
- Misrouted requests currently require manual re-routing by the receiving
  team.

## Actors / Stakeholders

- **Employee (Requester)** — the person experiencing the problem and
  initiating a request.
- **Support Agent / Department Member** — the person or team who receives
  the routed request (IT, HR, Facilities, etc.) and resolves it.
- **Department Admin** — someone within a department who configures what
  kinds of issues route to their team, and manages availability/queue.
- **Head of HR** — a distinguished, singular role (not a general HR staff
  member). The only person authorized to view or resolve requests flagged
  sensitive. Sensitive requests go to this person specifically, not to HR
  staff in general.
- **System Administrator** — manages department definitions, routing rules,
  and overall system configuration (company-wide).

## Functional Requirements

1. Employee can describe a problem in free-text/natural language through the
   application's own chat-style input (not through a third-party chat
   tool).
2. System interprets the description and determines the most likely
   relevant department/category (e.g. IT, HR, Facilities).
3. System routes/connects the employee to the identified department:
   - It identifies the correct department and places the request in that
     department's queue.
   - The receiving staff member then resolves it via one of two required
     paths: starting a **live chat** with the employee, or applying a
     **remote fix** directly — whichever the issue needs.
4. If the system is not confident about the correct category, it asks a
   clarifying follow-up question before routing (rather than guessing).
5. Employee can see confirmation of which department/person they've been
   connected to, and why (e.g. "Routed to IT Helpdesk").
6. Employee can correct a misrouted request (e.g. "this isn't IT, it's
   HR") and the system re-routes accordingly.
7. Each department can view and manage the incoming requests routed to
   them (a basic queue/inbox view).
8. Immediately after routing, the system checks whether a request is
   sensitive. Sensitive requests do **not** enter the routed department's
   queue at all — they go into a completely separate queue visible only
   to the **Head of HR**. No general department staff, admin, or audit
   view can see a sensitive request at any point.
9. System maintains a record/history of past requests and their routing
   outcome, for accountability and future routing improvement.
10. Every request has a clear **owner** — the department/person currently
    responsible for it — visible to both the employee and the receiving
    department, so ownership is never ambiguous.
11. Every request has a visible **status** (e.g. Received, In Progress,
    Pending, Resolved) that the employee can check at any time, so status is
    never unclear.
12. For requests that require sign-off (e.g. expense approval), the system
    shows whether approval is pending, granted, or denied, and by whom — so
    approval is never unclear.

## Non-Functional Requirements

- **Privacy/Confidentiality**: Sensitive requests (especially HR/personal
  ones) must not be visible to anyone outside the relevant department.
- **Reliability**: Routing must degrade gracefully — if classification
  fails or is uncertain, the system must not silently drop the request; it
  should ask for clarification or fall back to a default/general queue.
- **Response time**: Initial routing response to the employee should feel
  near-instant (seconds, not minutes) even if a human hasn't yet picked up
  the request.
- **Auditability**: All routing decisions should be traceable (what was
  said, what category was chosen, who received it) for review and
  improvement.
- **Usability**: No training should be required for an employee to use it
  — natural, conversational input only.
- **Scalability**: Should handle requests across the whole company
  (assume mid-to-large size org; exact number TBD — see Unknowns).

## Assumptions / Constraints / Unknowns

**Assumptions**
- Employees will interact with the system via a chat-like interface **built
  into the standalone application itself** (not a form, and not a
  third-party chat tool).
- Initial version targets a fixed, known set of departments (not
  infinitely extensible categories).
- A human will always ultimately handle the resolution — this system's job
  is *routing*, not resolving the issue itself.
- Employees will need to access this application separately (e.g. via a
  browser, desktop, or mobile app) rather than through an existing tool
  they already use daily — this is treated as an acceptable trade-off in
  exchange for having one dedicated, purpose-built system.

**Constraints**
- The system is a **standalone application** — it must not depend on or be
  embedded inside an existing chat tool (e.g. Slack/Teams) or intranet
  portal. It has its own interface, its own login, and its own data.
- Sensitive categories (HR) need stricter access control than others.

**Unknowns (to be resolved before implementation)**
- Exact list of departments/categories to support at launch.
- Whether routing connects the employee to a live person in real time or
  simply creates a ticket in the right queue.
- Whether one issue can span multiple departments (e.g. "coworker damaged
  company laptop" → HR + IT).
- Approximate number of employees / expected daily request volume.
- Whether department queues need SLAs (e.g. response within X hours).
- What happens outside of department working hours.
- Whether to integrate with an existing company identity/login system
  (SSO) for authentication, or build login from scratch.
- Whether employee status notifications ("Pending", "Resolved") are
  in-app only, or also sent via email/mobile.

## Non-Goals

- This system will **not** resolve issues itself — no automated
  troubleshooting, ticket resolution, or replacing human judgment.
- This system will **not** replace existing ticketing tools outright in
  v1 — it focuses on routing the conversation/request to the right place.
- This system will **not** be built as a plugin, bot, or extension inside
  an existing chat tool (e.g. Slack/Teams) or intranet — it is a separate,
  standalone application with its own interface.
- This system will **not** handle external/customer-facing support — internal
  employees only.
- No AI-driven decision-making beyond classification/routing (e.g. it will
  not auto-approve HR actions, IT resets, etc.).

## Examples of Correct / Incorrect Behavior

**Correct behavior**

| Employee says | System does |
|---|---|
| "My laptop stopped working" | Routes to **IT**, confirms: "Routed to IT Helpdesk." |
| "I have a problem with a coworker" | Routes to **HR**, keeps the request private/visible only to HR. |
| "The AC in my office isn't working" | Routes to **Facilities**. |
| "My badge won't let me into the building" | Routes to **Facilities** (or Security, if that's a defined department) — and if both are plausible, asks a clarifying question first rather than guessing. |
| "I think someone is being harassed" | Routes to **HR**, and treats it as a sensitive case (restricted visibility). |
| "I'm not sure who to ask about expense reports" | Routes to **Finance**. |
| Ambiguous input, e.g. "I have an issue" | System asks a clarifying follow-up ("Can you tell me a bit more? Is this about your equipment, a person, the office, or something else?") instead of guessing. |
| Employee says "This should've gone to HR, not IT" after being routed to IT | System re-routes the request to HR and confirms the change. |

**Incorrect behavior (what should NOT happen)**

| Situation | What must NOT happen |
|---|---|
| "My laptop stopped working" | System should **not** route this to HR, Facilities, or any non-IT department. |
| "I have a problem with a coworker" | System should **not** route this to IT, and must **not** display it in a general/shared queue visible to other departments. |
| Ambiguous or low-confidence input | System should **not** silently guess a department and route without any confirmation — it must ask a clarifying question instead. |
| A misrouted request | System should **not** require the employee to start over from scratch — correcting the routing should re-route the *same* request, not create a duplicate. |
| A sensitive HR/interpersonal case | System should **not** log or expose the content of the request to non-HR staff, dashboards, or general audit views. |
| Any request | System should **not** attempt to resolve the issue itself (e.g. giving IT troubleshooting steps or HR advice) — its job is routing only, not resolution. |
| System has no matching department for a request | System should **not** drop the request silently — it should fall back to a default/general queue or ask the employee for clarification. |

## Acceptance Criteria

- Given an employee describes a problem in plain language, the system
  correctly identifies and routes to the appropriate department for a
  defined set of common example inputs (e.g. laptop issues → IT,
  interpersonal conflict → HR, broken office equipment → Facilities).
- If the system is unsure which department applies, it asks a clarifying
  question instead of guessing incorrectly.
- The employee receives clear confirmation of where their request was
  routed.
- A misrouted request can be corrected by the employee and re-routed
  successfully.
- HR/sensitive requests are not visible to non-HR department views.
- Each department can see a list of requests currently routed to them.
