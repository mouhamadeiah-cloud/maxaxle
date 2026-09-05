# Project Guidelines & Architecture Protection

## Golden Rules for Development

1. **Permanent Hub Freeze & Active Operationen Workspace:**
   - `src/components/Hub.tsx` is a **PERMANENTLY FROZEN BACKUP**. It is protected and must NEVER be modified, patched, refactored, or touched in future turns.
   - `src/components/OperationenView.tsx` is the **ACTIVE WORKSPACE** for all upcoming developments, UI adjustments, button refactoring, debugging, and feature additions.
   - Any modifications to document generation, card stacks, or operations workflows must be applied EXCLUSIVELY to `OperationenView.tsx` and its designated components.

2. **Preserve Existing Functionality:**
   - Never modify, delete, or rewrite existing core features, the circular Operations Hub layout, cinematic transitions, gold/emerald pulse animations, or unrelated document structures unless explicitly requested.
   - Maintain the established circular orbital geometry and visual consistency across all views.

3. **Surgical Patching Only:**
   - When a modification, bug fix, or new field (e.g., custom document fields, vehicle data inputs, Übergabeprotokoll options) is requested, apply ONLY a local, surgical code patch to the active workspace (`OperationenView.tsx`).
   - Do NOT rebuild components or modules from scratch.
   - Always verify existing component structure before editing.

4. **Strict Adherence to Checkpoints:**
   - Respect "CHECKPOINT V1" as the stable baseline architecture.
   - Keep all existing document generation flows (Handelsrechnung, E-Rechnung, EU-Export, Drittland, Kaufvertrag, Angebot, Probefahrt, Übergabeprotokoll) fully functional, validated, and lint-clean.
