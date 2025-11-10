#!/usr/bin/env python3
# 🌀 Helix Collective v14.5 — Notion Export System
# scripts/export_for_notion.py
# Author: Claude Code + Andrew John Ward
#
# Purpose: Export local Shadow archives to Notion-compatible JSON packages
# Usage: python3 scripts/export_for_notion.py --type context --session-id <id>
#        python3 scripts/export_for_notion.py --type timeline --days 7

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# ============================================================================
# NOTION SCHEMA DEFINITIONS
# ============================================================================

"""
Notion Database Schemas for Reference:

1. Context Snapshots (Database ID: d704854868474666b4b774750f8b134a)
   - Session ID (Title)
   - AI System (Select: Claude, GPT4o, Manus, etc.)
   - Created (Date)
   - Summary (Text)
   - Key Decisions (Text)
   - Next Steps (Text)
   - Full Context (Text - JSON string)

2. Event Log (Database ID: acb01d4a955d4775aaeb2310d1da1102)
   - Event (Title)
   - Timestamp (Date)
   - Event Type (Select: Status, Command, Error, Setup, Ritual)
   - Agent (Relation to Agent Registry)
   - Description (Text)
   - UCF Snapshot (Text - JSON string)
"""

# ============================================================================
# CONTEXT SNAPSHOT EXPORTER
# ============================================================================

class NotionExporter:
    """Export local archives to Notion-compatible JSON format."""

    def __init__(self):
        self.archive_dir = Path("Shadow/manus_archive")
        self.output_dir = Path("Shadow/notion_exports")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _list_archives(self, pattern: str = "*.json") -> List[Path]:
        """List all JSON archives matching pattern."""
        if not self.archive_dir.exists():
            return []
        return list(self.archive_dir.glob(pattern))

    def _read_archive(self, filepath: Path) -> Optional[Dict[str, Any]]:
        """Read and parse JSON archive (handles both single objects and multi-object files)."""
        try:
            with open(filepath, 'r') as f:
                content = f.read().strip()

                # Try parsing as single JSON object first
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    pass

                # Handle multi-object files (object + array common in logs)
                # Split by closing brace/bracket followed by opening brace/bracket
                import re
                # Find all complete JSON objects/arrays
                json_objects = []
                depth = 0
                current_obj = []
                in_string = False
                escape_next = False

                for char in content:
                    if escape_next:
                        current_obj.append(char)
                        escape_next = False
                        continue

                    if char == '\\':
                        escape_next = True
                        current_obj.append(char)
                        continue

                    if char == '"':
                        in_string = not in_string

                    if not in_string:
                        if char in '{[':
                            depth += 1
                        elif char in '}]':
                            depth -= 1

                    current_obj.append(char)

                    if depth == 0 and len(current_obj) > 0 and current_obj[0] in '{[':
                        try:
                            obj_str = ''.join(current_obj).strip()
                            if obj_str:
                                parsed = json.loads(obj_str)
                                json_objects.append(parsed)
                                current_obj = []
                        except:
                            current_obj = []

                # Return first object (main log), but merge event_log arrays if multiple
                if json_objects:
                    result = json_objects[0] if isinstance(json_objects[0], dict) else {"operations": json_objects[0]}

                    # If there are additional arrays, treat them as additional operations
                    for obj in json_objects[1:]:
                        if isinstance(obj, list):
                            if "operations" not in result:
                                result["operations"] = []
                            result["operations"].extend(obj)

                    return result

                return None

        except (IOError, Exception) as e:
            print(f"⚠️  Error reading {filepath.name}: {e}")
            return None

    def export_session_context(
        self,
        session_id: Optional[str] = None,
        output_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Export session context snapshot to Notion-compatible JSON.

        Args:
            session_id: Specific session to export, or None for all recent
            output_file: Custom output filename, or None for auto-generated

        Returns:
            Dictionary with export metadata and file path
        """
        print(f"\n{'='*70}")
        print("📤 EXPORTING SESSION CONTEXTS TO NOTION FORMAT")
        print(f"{'='*70}\n")

        # Search for context archives
        archives = self._list_archives(pattern="context_*.json")

        if not archives:
            print("❌ No context archives found in Shadow/manus_archive/")
            return {
                "status": "error",
                "message": "No archives found",
                "exported_count": 0
            }

        print(f"📂 Found {len(archives)} context archives")

        # Load and transform archives
        notion_entries = []
        for archive_path in archives:
            try:
                archive_data = self._read_archive(archive_path)

                if not archive_data:
                    continue

                # Filter by session_id if specified
                if session_id and archive_data.get("session_id") != session_id:
                    continue

                # Transform to Notion format
                notion_entry = self._transform_context_to_notion(archive_data)
                if notion_entry:
                    notion_entries.append(notion_entry)
                    print(f"✅ Prepared: {notion_entry['session_id']}")

            except Exception as e:
                print(f"⚠️  Error processing {archive_path.name}: {e}")
                continue

        if not notion_entries:
            print(f"❌ No matching sessions found")
            return {
                "status": "error",
                "message": "No matching sessions",
                "exported_count": 0
            }

        # Generate output
        if not output_file:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            if session_id:
                output_file = f"notion_context_{session_id}_{timestamp}.json"
            else:
                output_file = f"notion_contexts_batch_{timestamp}.json"

        output_path = self.output_dir / output_file

        # Create export package
        export_package = {
            "export_metadata": {
                "exported_at": datetime.utcnow().isoformat(),
                "export_type": "context_snapshots",
                "notion_database": "Context Snapshots",
                "notion_database_id": "d704854868474666b4b774750f8b134a",
                "entry_count": len(notion_entries),
                "source": "helix-unified local archives"
            },
            "notion_entries": notion_entries,
            "import_instructions": {
                "step_1": "Copy this entire JSON file",
                "step_2": "Paste into Main Claude (with Notion MCP access)",
                "step_3": "Ask Claude: 'Please import these context snapshots into Notion'",
                "step_4": "Claude will use MCP to create entries in the Context Snapshots database",
                "note": "Each entry will be deduplicated by Session ID"
            }
        }

        # Save to file
        with open(output_path, "w") as f:
            json.dump(export_package, f, indent=2)

        print(f"\n✅ Export complete!")
        print(f"📦 Package saved to: {output_path}")
        print(f"📊 Entries exported: {len(notion_entries)}")
        print(f"\n{'='*70}")
        print("NEXT STEPS:")
        print(f"{'='*70}")
        print("1. Copy the contents of this file:")
        print(f"   cat {output_path}")
        print("2. Open Main Claude (with Notion access)")
        print("3. Paste the JSON and say:")
        print('   "Import these context snapshots into Notion"')
        print(f"{'='*70}\n")

        return {
            "status": "success",
            "output_path": str(output_path),
            "exported_count": len(notion_entries),
            "entries": notion_entries
        }

    def _transform_context_to_notion(self, archive_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Transform local archive data to Notion Context Snapshot format."""
        try:
            # Extract required fields with fallbacks
            session_id = archive_data.get("session_id", "unknown-session")
            ai_system = archive_data.get("ai_system", "Unknown")
            created = archive_data.get("created", archive_data.get("timestamp", ""))
            summary = archive_data.get("summary", "")
            decisions = archive_data.get("decisions", archive_data.get("key_decisions", ""))
            next_steps = archive_data.get("next_steps", "")

            # Full context as JSON string (excluding redundant fields)
            full_context = {
                k: v for k, v in archive_data.items()
                if k not in ["session_id", "ai_system", "created", "summary", "decisions", "next_steps"]
            }

            return {
                "session_id": session_id,
                "ai_system": ai_system,
                "created": created,
                "summary": summary or "Context snapshot from local archive",
                "key_decisions": decisions or "No decisions recorded",
                "next_steps": next_steps or "No next steps specified",
                "full_context": json.dumps(full_context, indent=2) if full_context else "{}"
            }

        except Exception as e:
            print(f"⚠️  Error transforming archive data: {e}")
            return None

    # ========================================================================
    # UCF TIMELINE EXPORTER
    # ========================================================================

    def export_ucf_timeline(
        self,
        days: int = 7,
        output_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Export UCF timeline data to Notion-compatible Event Log format.

        Args:
            days: Number of days of history to export
            output_file: Custom output filename, or None for auto-generated

        Returns:
            Dictionary with export metadata and file path
        """
        print(f"\n{'='*70}")
        print(f"📤 EXPORTING UCF TIMELINE (Last {days} Days)")
        print(f"{'='*70}\n")

        # Load manus logs and extract UCF timeline
        manus_log_files = sorted(self._list_archives(pattern="manus_log*.json"), reverse=True)
        manus_log = self._read_archive(manus_log_files[0]) if manus_log_files else None

        if not manus_log:
            print("❌ No manus_log archives found")
            return {
                "status": "error",
                "message": "No manus_log found",
                "exported_count": 0
            }

        # Extract timeline events
        notion_events = []
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # Process operations from manus_log
        operations = manus_log.get("operations", [])
        print(f"📂 Found {len(operations)} operations in manus_log")

        for op in operations:
            try:
                # Parse timestamp
                op_timestamp = op.get("timestamp", "")
                if op_timestamp:
                    try:
                        op_date = datetime.fromisoformat(op_timestamp.replace("Z", "+00:00"))
                        if op_date < cutoff_date:
                            continue
                    except:
                        pass

                # Transform to Notion Event Log format
                notion_event = self._transform_operation_to_event(op)
                if notion_event:
                    notion_events.append(notion_event)
                    print(f"✅ Prepared: {notion_event['event']}")

            except Exception as e:
                print(f"⚠️  Error processing operation: {e}")
                continue

        # Also check for ritual execution logs
        z88_log_files = sorted(self._list_archives(pattern="z88_log*.json"), reverse=True)
        z88_log = self._read_archive(z88_log_files[0]) if z88_log_files else None
        if z88_log:
            # Handle both dict format and list format
            if isinstance(z88_log, dict):
                rituals = z88_log.get("rituals", z88_log.get("operations", []))
            elif isinstance(z88_log, list):
                rituals = z88_log
            else:
                rituals = []
            print(f"🔮 Found {len(rituals)} ritual executions")

            for ritual in rituals:
                try:
                    ritual_timestamp = ritual.get("timestamp", "")
                    if ritual_timestamp:
                        try:
                            ritual_date = datetime.fromisoformat(ritual_timestamp.replace("Z", "+00:00"))
                            if ritual_date < cutoff_date:
                                continue
                        except:
                            pass

                    notion_event = self._transform_ritual_to_event(ritual)
                    if notion_event:
                        notion_events.append(notion_event)
                        print(f"✅ Prepared: {notion_event['event']}")

                except Exception as e:
                    print(f"⚠️  Error processing ritual: {e}")
                    continue

        if not notion_events:
            print(f"❌ No timeline events found in last {days} days")
            return {
                "status": "error",
                "message": f"No events in last {days} days",
                "exported_count": 0
            }

        # Sort by timestamp (newest first)
        notion_events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        # Generate output
        if not output_file:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            output_file = f"notion_timeline_{days}days_{timestamp}.json"

        output_path = self.output_dir / output_file

        # Create export package
        export_package = {
            "export_metadata": {
                "exported_at": datetime.utcnow().isoformat(),
                "export_type": "event_log_timeline",
                "notion_database": "Event Log",
                "notion_database_id": "acb01d4a955d4775aaeb2310d1da1102",
                "entry_count": len(notion_events),
                "time_range_days": days,
                "source": "helix-unified local archives"
            },
            "notion_events": notion_events,
            "import_instructions": {
                "step_1": "Copy this entire JSON file",
                "step_2": "Paste into Main Claude (with Notion MCP access)",
                "step_3": "Ask Claude: 'Please import these events into the Notion Event Log'",
                "step_4": "Claude will use MCP to create entries with proper timestamps and UCF snapshots",
                "note": "Events are sorted newest first. Duplicates will be skipped."
            }
        }

        # Save to file
        with open(output_path, "w") as f:
            json.dump(export_package, f, indent=2)

        print(f"\n✅ Export complete!")
        print(f"📦 Package saved to: {output_path}")
        print(f"📊 Events exported: {len(notion_events)}")
        print(f"\n{'='*70}")
        print("NEXT STEPS:")
        print(f"{'='*70}")
        print("1. Copy the contents of this file:")
        print(f"   cat {output_path}")
        print("2. Open Main Claude (with Notion access)")
        print("3. Paste the JSON and say:")
        print('   "Import these timeline events into Notion Event Log"')
        print(f"{'='*70}\n")

        return {
            "status": "success",
            "output_path": str(output_path),
            "exported_count": len(notion_events),
            "events": notion_events
        }

    def _transform_operation_to_event(self, op: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Transform manus operation to Notion Event Log format."""
        try:
            event_name = op.get("name", "Operation Executed")
            timestamp = op.get("timestamp", datetime.utcnow().isoformat())
            agent = op.get("agent", "Manus")
            description = op.get("description", str(op))

            # Extract UCF snapshot if available
            ucf_snapshot = {}
            if "ucf" in op:
                ucf_snapshot = op["ucf"]
            elif "harmony" in op or "klesha" in op or "prana" in op:
                ucf_snapshot = {
                    "harmony": op.get("harmony"),
                    "klesha": op.get("klesha"),
                    "prana": op.get("prana")
                }

            # Determine event type
            event_type = "Command"
            if "error" in description.lower() or "failed" in description.lower():
                event_type = "Error"
            elif "ritual" in event_name.lower():
                event_type = "Ritual"
            elif "status" in event_name.lower():
                event_type = "Status"

            return {
                "event": event_name,
                "timestamp": timestamp,
                "event_type": event_type,
                "agent": agent,
                "description": description,
                "ucf_snapshot": json.dumps(ucf_snapshot, indent=2) if ucf_snapshot else "{}"
            }

        except Exception as e:
            print(f"⚠️  Error transforming operation: {e}")
            return None

    def _transform_ritual_to_event(self, ritual: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Transform Z-88 ritual execution to Notion Event Log format."""
        try:
            ritual_name = ritual.get("name", "Z-88 Ritual")
            timestamp = ritual.get("timestamp", datetime.utcnow().isoformat())

            # Build description
            steps = ritual.get("steps_completed", 0)
            harmony = ritual.get("harmony_delta", 0)
            description = f"Executed {steps}-step ritual. Harmony delta: {harmony:+.3f}"

            # UCF snapshot after ritual
            ucf_snapshot = ritual.get("ucf_after", {})

            return {
                "event": ritual_name,
                "timestamp": timestamp,
                "event_type": "Ritual",
                "agent": "Manus",
                "description": description,
                "ucf_snapshot": json.dumps(ucf_snapshot, indent=2) if ucf_snapshot else "{}"
            }

        except Exception as e:
            print(f"⚠️  Error transforming ritual: {e}")
            return None

# ============================================================================
# CLI INTERFACE
# ============================================================================

def main():
    """Main entry point with CLI argument parsing."""
    parser = argparse.ArgumentParser(
        description="Export Helix archives to Notion-compatible JSON",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Export all session contexts
  python3 scripts/export_for_notion.py --type context

  # Export specific session
  python3 scripts/export_for_notion.py --type context --session-id claude-2025-10-30

  # Export last 7 days of timeline
  python3 scripts/export_for_notion.py --type timeline --days 7

  # Export last 30 days of timeline
  python3 scripts/export_for_notion.py --type timeline --days 30

Output files will be saved to: Shadow/notion_exports/
        """
    )

    parser.add_argument(
        "--type",
        required=True,
        choices=["context", "timeline"],
        help="Type of data to export (context=session snapshots, timeline=UCF events)"
    )

    parser.add_argument(
        "--session-id",
        type=str,
        help="Specific session ID to export (only for --type context)"
    )

    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days of history to export (only for --type timeline, default: 7)"
    )

    parser.add_argument(
        "--output",
        type=str,
        help="Custom output filename (optional)"
    )

    args = parser.parse_args()

    # Create exporter
    exporter = NotionExporter()

    # Execute export based on type
    if args.type == "context":
        result = exporter.export_session_context(
            session_id=args.session_id,
            output_file=args.output
        )
    elif args.type == "timeline":
        result = exporter.export_ucf_timeline(
            days=args.days,
            output_file=args.output
        )
    else:
        print(f"❌ Unknown export type: {args.type}")
        sys.exit(1)

    # Exit with appropriate code
    if result["status"] == "success":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
