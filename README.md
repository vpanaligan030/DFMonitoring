# DF Flow Track

Disposition Fund lifecycle monitoring for a Special Disbursing Officer. The active application is a Vite/React single-page application; the domain layer is framework-independent and is shared by the UI, reports, and backend adapters.

## Architecture

* `src/domain/` — canonical statuses, financial calculations, integrity checks and next-action rules.
* `src/backend/dfWorkflow.js` — authoritative workflow service. It accepts authenticated identity, resolves a trusted profile, enforces section access, state transitions, financial limits, and optimistic versions, and writes audit events.
* `src/base44/entities/` — entity schema manifests and RLS policy documentation for Base44 deployment.
* `src/` — role-aware dashboard, filtered register, detail drawer and CSV report UI.

The included `MemoryRepository` is a deterministic development/test adapter. A Base44 deployment must implement the same repository contract with transactional compare-and-swap updates and atomic sequence allocation.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

The demo role selector is explicitly a local UI preview. Production identity is always supplied by Base44 authentication and resolved through `UserProfile`; workflow requests never accept a role or assigned section as authority.
