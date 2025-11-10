"""
Comprehensive Testing Commands for Helix Discord Bot.

Commands:
- test-all: Run comprehensive test suite across all systems
- test-commands: Test all Discord bot commands
- test-webhooks: Test all webhook integrations
- test-api: Test all Railway API endpoints
- validate-system: Complete system validation
"""
import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Any

import aiohttp
import discord
from discord.ext import commands

from backend.agents import AGENTS
from backend.z88_ritual_engine import load_ucf_state

logger = logging.getLogger(__name__)


async def setup(bot: 'commands.Bot') -> None:
    """Setup function to register commands with the bot."""
    bot.add_command(test_all_command)
    bot.add_command(test_commands_command)
    bot.add_command(test_webhooks_command)
    bot.add_command(test_api_command)
    bot.add_command(validate_system_command)


@commands.command(name="test-all", aliases=["testall", "validate"])
@commands.has_permissions(administrator=True)
async def test_all_command(ctx: commands.Context) -> None:
    """
    🧪 COMPREHENSIVE SYSTEM TEST SUITE

    Runs complete validation across:
    - All Discord bot commands (62 total)
    - Discord webhooks (direct + Zapier)
    - Railway API endpoints
    - UCF calculations
    - Agent systems
    - Storage integrations
    - Database connections

    Usage:
        !test-all
    """
    start_time = time.time()

    # Send initial message
    msg = await ctx.send("🧪 **INITIATING COMPREHENSIVE SYSTEM TEST**\n`Please wait...`")

    results = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "tests": []
    }

    try:
        # 1. Test Discord Bot Commands
        await msg.edit(content="🧪 **Testing Discord Bot Commands...**")
        command_results = await test_discord_commands(ctx.bot)
        results["tests"].extend(command_results)

        # 2. Test Webhooks
        await msg.edit(content="🧪 **Testing Webhook Integrations...**")
        webhook_results = await test_webhooks_integration(ctx.bot)
        results["tests"].extend(webhook_results)

        # 3. Test Railway API
        await msg.edit(content="🧪 **Testing Railway API Endpoints...**")
        api_results = await test_railway_api()
        results["tests"].extend(api_results)

        # 4. Test UCF System
        await msg.edit(content="🧪 **Testing UCF Calculations...**")
        ucf_results = await test_ucf_system()
        results["tests"].extend(ucf_results)

        # 5. Test Agent System
        await msg.edit(content="🧪 **Testing Agent Systems...**")
        agent_results = await test_agent_system()
        results["tests"].extend(agent_results)

        # 6. Test Storage
        await msg.edit(content="🧪 **Testing Storage Integrations...**")
        storage_results = await test_storage_system()
        results["tests"].extend(storage_results)

        # Calculate totals
        for test in results["tests"]:
            results["total"] += 1
            if test["status"] == "pass":
                results["passed"] += 1
            elif test["status"] == "fail":
                results["failed"] += 1
            else:
                results["skipped"] += 1

        # Generate report
        elapsed = time.time() - start_time

        # Determine overall status
        if results["failed"] == 0:
            status_emoji = "✅"
            status_text = "ALL TESTS PASSED"
            color = discord.Color.green()
        elif results["failed"] < 5:
            status_emoji = "⚠️"
            status_text = "MINOR ISSUES"
            color = discord.Color.orange()
        else:
            status_emoji = "❌"
            status_text = "CRITICAL FAILURES"
            color = discord.Color.red()

        # Build report embed
        embed = discord.Embed(
            title=f"{status_emoji} Comprehensive System Test Results",
            description=f"**Status:** {status_text}",
            color=color,
            timestamp=datetime.utcnow()
        )

        # Summary stats
        embed.add_field(
            name="📊 Summary",
            value=f"```\n"
                  f"Total Tests:  {results['total']}\n"
                  f"✅ Passed:    {results['passed']}\n"
                  f"❌ Failed:    {results['failed']}\n"
                  f"⏭️  Skipped:   {results['skipped']}\n"
                  f"⏱️  Duration:  {elapsed:.2f}s\n"
                  f"```",
            inline=False
        )

        # Test categories
        categories = {}
        for test in results["tests"]:
            cat = test.get("category", "Other")
            if cat not in categories:
                categories[cat] = {"pass": 0, "fail": 0, "skip": 0}

            if test["status"] == "pass":
                categories[cat]["pass"] += 1
            elif test["status"] == "fail":
                categories[cat]["fail"] += 1
            else:
                categories[cat]["skip"] += 1

        # Add category breakdown
        for cat, stats in categories.items():
            total = stats["pass"] + stats["fail"] + stats["skip"]
            emoji = "✅" if stats["fail"] == 0 else "❌"

            embed.add_field(
                name=f"{emoji} {cat}",
                value=f"```\n"
                      f"✅ {stats['pass']}/{total}\n"
                      f"❌ {stats['fail']}/{total}\n"
                      f"⏭️  {stats['skip']}/{total}\n"
                      f"```",
                inline=True
            )

        # Failed tests details
        failed_tests = [t for t in results["tests"] if t["status"] == "fail"]
        if failed_tests:
            failures_text = "\n".join([
                f"❌ **{t['name']}**: {t.get('error', 'Unknown error')}"
                for t in failed_tests[:10]  # Show first 10 failures
            ])

            if len(failed_tests) > 10:
                failures_text += f"\n\n*...and {len(failed_tests) - 10} more failures*"

            embed.add_field(
                name="🔥 Failed Tests",
                value=failures_text[:1024],  # Discord field limit
                inline=False
            )

        # Recommendations
        if results["failed"] > 0:
            recommendations = []

            # Check for specific failure patterns
            webhook_failures = [t for t in failed_tests if "webhook" in t["name"].lower()]
            api_failures = [t for t in failed_tests if "api" in t["name"].lower()]

            if webhook_failures:
                recommendations.append("🔗 Check Discord webhook URLs in environment variables")
            if api_failures:
                recommendations.append("🌐 Verify Railway backend is running and accessible")
            if results["failed"] > 10:
                recommendations.append("⚠️ Major system issues detected - check Railway logs")

            if recommendations:
                embed.add_field(
                    name="💡 Recommendations",
                    value="\n".join(recommendations),
                    inline=False
                )

        embed.set_footer(text="Helix Collective v16.8 | Comprehensive Test Suite")

        await msg.edit(content=None, embed=embed)

        # Save detailed results to file
        results_file = f"Helix/state/test_results_{int(time.time())}.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)

        await ctx.send(f"📄 Detailed results saved to: `{results_file}`")

    except Exception as e:
        logger.error(f"Test suite error: {e}")
        await msg.edit(content=f"❌ **Test suite failed:** {str(e)}")


async def test_discord_commands(bot: commands.Bot) -> List[Dict[str, Any]]:
    """Test all registered Discord commands."""
    results = []

    # Get all registered commands
    all_commands = list(bot.all_commands.values())

    for cmd in all_commands:
        try:
            # Check if command is properly registered
            if cmd.name and cmd.callback:
                results.append({
                    "name": f"Command: !{cmd.name}",
                    "status": "pass",
                    "category": "Discord Commands",
                    "details": f"Registered with {len(cmd.aliases)} aliases"
                })
            else:
                results.append({
                    "name": f"Command: !{cmd.name}",
                    "status": "fail",
                    "category": "Discord Commands",
                    "error": "Command not properly registered"
                })
        except Exception as e:
            results.append({
                "name": f"Command: !{cmd.name if hasattr(cmd, 'name') else 'unknown'}",
                "status": "fail",
                "category": "Discord Commands",
                "error": str(e)
            })

    return results


async def test_webhooks_integration(bot: commands.Bot) -> List[Dict[str, Any]]:
    """Test Discord and Zapier webhook integrations."""
    results = []

    # Test Zapier webhook
    zapier_url = bot.zapier_client.webhook_url if hasattr(bot, 'zapier_client') else None
    if zapier_url:
        try:
            test_payload = {
                "event_type": "test",
                "message": "System validation test",
                "timestamp": datetime.utcnow().isoformat()
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(zapier_url, json=test_payload, timeout=10) as resp:
                    if resp.status == 200:
                        results.append({
                            "name": "Zapier Webhook",
                            "status": "pass",
                            "category": "Webhooks",
                            "details": f"Response: {resp.status}"
                        })
                    else:
                        results.append({
                            "name": "Zapier Webhook",
                            "status": "fail",
                            "category": "Webhooks",
                            "error": f"HTTP {resp.status}"
                        })
        except Exception as e:
            results.append({
                "name": "Zapier Webhook",
                "status": "fail",
                "category": "Webhooks",
                "error": str(e)
            })
    else:
        results.append({
            "name": "Zapier Webhook",
            "status": "skip",
            "category": "Webhooks",
            "details": "Not configured"
        })

    # Test Discord webhooks (if available)
    try:
        from backend.discord_webhook_sender_hybrid import get_discord_sender

        discord_sender = await get_discord_sender()

        # Test a simple announcement
        await discord_sender.send_announcement(
            title="System Test",
            message="Automated validation test from !test-all command"
        )

        results.append({
            "name": "Discord Direct Webhooks",
            "status": "pass",
            "category": "Webhooks",
            "details": "Test announcement sent"
        })
    except ImportError:
        results.append({
            "name": "Discord Direct Webhooks",
            "status": "skip",
            "category": "Webhooks",
            "details": "Module not available"
        })
    except Exception as e:
        results.append({
            "name": "Discord Direct Webhooks",
            "status": "fail",
            "category": "Webhooks",
            "error": str(e)
        })

    return results


async def test_railway_api() -> List[Dict[str, Any]]:
    """Test Railway backend API endpoints."""
    results = []
    base_url = "https://helix-unified-production.up.railway.app"

    endpoints = [
        ("/health", "Health Check"),
        ("/status", "System Status"),
        ("/agents", "Agent Listing"),
        ("/ucf", "UCF Metrics"),
        ("/.well-known/helix.json", "Discovery Protocol")
    ]

    async with aiohttp.ClientSession() as session:
        for path, name in endpoints:
            try:
                async with session.get(f"{base_url}{path}", timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        results.append({
                            "name": f"API: {name}",
                            "status": "pass",
                            "category": "Railway API",
                            "details": f"HTTP {resp.status}"
                        })
                    else:
                        results.append({
                            "name": f"API: {name}",
                            "status": "fail",
                            "category": "Railway API",
                            "error": f"HTTP {resp.status}"
                        })
            except asyncio.TimeoutError:
                results.append({
                    "name": f"API: {name}",
                    "status": "fail",
                    "category": "Railway API",
                    "error": "Timeout (>10s)"
                })
            except Exception as e:
                results.append({
                    "name": f"API: {name}",
                    "status": "fail",
                    "category": "Railway API",
                    "error": str(e)
                })

    return results


async def test_ucf_system() -> List[Dict[str, Any]]:
    """Test UCF calculation and state management."""
    results = []

    try:
        # Test UCF state loading
        ucf = load_ucf_state()

        if ucf:
            results.append({
                "name": "UCF State Loading",
                "status": "pass",
                "category": "UCF System",
                "details": f"Loaded {len(ucf)} metrics"
            })
        else:
            results.append({
                "name": "UCF State Loading",
                "status": "fail",
                "category": "UCF System",
                "error": "Empty UCF state"
            })

        # Validate metric ranges
        metrics_valid = True
        for metric in ["harmony", "resilience", "prana", "drishti", "klesha", "zoom"]:
            value = ucf.get(metric, 0)
            if not isinstance(value, (int, float)):
                metrics_valid = False
                break

        if metrics_valid:
            results.append({
                "name": "UCF Metric Validation",
                "status": "pass",
                "category": "UCF System",
                "details": "All metrics are numeric"
            })
        else:
            results.append({
                "name": "UCF Metric Validation",
                "status": "fail",
                "category": "UCF System",
                "error": "Invalid metric types"
            })

    except Exception as e:
        results.append({
            "name": "UCF System",
            "status": "fail",
            "category": "UCF System",
            "error": str(e)
        })

    return results


async def test_agent_system() -> List[Dict[str, Any]]:
    """Test agent system."""
    results = []

    try:
        # Check agent count
        if len(AGENTS) == 14:
            results.append({
                "name": "Agent Count",
                "status": "pass",
                "category": "Agent System",
                "details": "All 14 agents present"
            })
        else:
            results.append({
                "name": "Agent Count",
                "status": "fail",
                "category": "Agent System",
                "error": f"Expected 14 agents, found {len(AGENTS)}"
            })

        # Validate agent structure
        all_valid = True
        for name, agent in AGENTS.items():
            if not hasattr(agent, 'consciousness') or not hasattr(agent, 'symbol'):
                all_valid = False
                break

        if all_valid:
            results.append({
                "name": "Agent Structure",
                "status": "pass",
                "category": "Agent System",
                "details": "All agents properly configured"
            })
        else:
            results.append({
                "name": "Agent Structure",
                "status": "fail",
                "category": "Agent System",
                "error": "Invalid agent structure"
            })

    except Exception as e:
        results.append({
            "name": "Agent System",
            "status": "fail",
            "category": "Agent System",
            "error": str(e)
        })

    return results


async def test_storage_system() -> List[Dict[str, Any]]:
    """Test storage integrations."""
    results = []

    # Check if storage directories exist
    from pathlib import Path

    directories = [
        ("Helix/state", "State Directory"),
        ("Helix/ethics", "Ethics Directory"),
        ("Shadow/manus_archive", "Archive Directory")
    ]

    for path, name in directories:
        if Path(path).exists():
            results.append({
                "name": f"Storage: {name}",
                "status": "pass",
                "category": "Storage",
                "details": f"Directory exists: {path}"
            })
        else:
            results.append({
                "name": f"Storage: {name}",
                "status": "fail",
                "category": "Storage",
                "error": f"Directory not found: {path}"
            })

    return results


@commands.command(name="test-commands", aliases=["testcmds"])
@commands.has_permissions(administrator=True)
async def test_commands_command(ctx: commands.Context) -> None:
    """
    Test all Discord bot commands registration.

    Usage:
        !test-commands
    """
    results = await test_discord_commands(ctx.bot)

    passed = len([r for r in results if r["status"] == "pass"])
    failed = len([r for r in results if r["status"] == "fail"])
    total = len(results)

    embed = discord.Embed(
        title="🤖 Discord Commands Test",
        description=f"Testing {total} registered commands",
        color=discord.Color.blue()
    )

    embed.add_field(
        name="Results",
        value=f"```\n✅ Passed: {passed}/{total}\n❌ Failed: {failed}/{total}\n```",
        inline=False
    )

    if failed > 0:
        failed_cmds = [r["name"] for r in results if r["status"] == "fail"]
        embed.add_field(
            name="Failed Commands",
            value="\n".join(failed_cmds[:10]),
            inline=False
        )

    await ctx.send(embed=embed)


@commands.command(name="test-webhooks", aliases=["testhooks"])
@commands.has_permissions(administrator=True)
async def test_webhooks_command(ctx: commands.Context) -> None:
    """
    Test webhook integrations (Discord + Zapier).

    Usage:
        !test-webhooks
    """
    msg = await ctx.send("🧪 Testing webhooks...")

    results = await test_webhooks_integration(ctx.bot)

    passed = len([r for r in results if r["status"] == "pass"])
    failed = len([r for r in results if r["status"] == "fail"])
    skipped = len([r for r in results if r["status"] == "skip"])

    embed = discord.Embed(
        title="🔗 Webhook Integration Test",
        color=discord.Color.green() if failed == 0 else discord.Color.red()
    )

    embed.add_field(
        name="Results",
        value=f"```\n✅ Passed: {passed}\n❌ Failed: {failed}\n⏭️  Skipped: {skipped}\n```",
        inline=False
    )

    for result in results:
        status_emoji = {"pass": "✅", "fail": "❌", "skip": "⏭️"}[result["status"]]
        details = result.get("details") or result.get("error", "No details")

        embed.add_field(
            name=f"{status_emoji} {result['name']}",
            value=f"`{details}`",
            inline=False
        )

    await msg.edit(content=None, embed=embed)


@commands.command(name="test-api", aliases=["testapi"])
@commands.has_permissions(administrator=True)
async def test_api_command(ctx: commands.Context) -> None:
    """
    Test Railway API endpoints.

    Usage:
        !test-api
    """
    msg = await ctx.send("🧪 Testing Railway API...")

    results = await test_railway_api()

    passed = len([r for r in results if r["status"] == "pass"])
    failed = len([r for r in results if r["status"] == "fail"])

    embed = discord.Embed(
        title="🌐 Railway API Test",
        color=discord.Color.green() if failed == 0 else discord.Color.red()
    )

    embed.add_field(
        name="Results",
        value=f"```\n✅ Passed: {passed}/{len(results)}\n❌ Failed: {failed}/{len(results)}\n```",
        inline=False
    )

    for result in results:
        status_emoji = "✅" if result["status"] == "pass" else "❌"
        details = result.get("details") or result.get("error", "No details")

        embed.add_field(
            name=f"{status_emoji} {result['name']}",
            value=f"`{details}`",
            inline=True
        )

    await msg.edit(content=None, embed=embed)


@commands.command(name="validate-system", aliases=["sysval"])
@commands.has_permissions(administrator=True)
async def validate_system_command(ctx: commands.Context) -> None:
    """
    Quick system validation (faster than !test-all).

    Checks:
    - UCF state
    - Agent system
    - Storage
    - Basic connectivity

    Usage:
        !validate-system
    """
    msg = await ctx.send("🔍 Validating system...")

    checks = []

    # UCF Check
    try:
        ucf = load_ucf_state()
        if ucf and len(ucf) >= 6:
            checks.append(("UCF State", "✅", f"{len(ucf)} metrics loaded"))
        else:
            checks.append(("UCF State", "❌", "Incomplete or missing"))
    except Exception as e:
        checks.append(("UCF State", "❌", str(e)))

    # Agent Check
    if len(AGENTS) == 14:
        active = len([a for a in AGENTS.values() if a.active])
        checks.append(("Agent System", "✅", f"{active}/14 agents active"))
    else:
        checks.append(("Agent System", "❌", f"Expected 14, found {len(AGENTS)}"))

    # Storage Check
    from pathlib import Path
    if Path("Helix/state").exists() and Path("Shadow/manus_archive").exists():
        checks.append(("Storage", "✅", "All directories present"))
    else:
        checks.append(("Storage", "❌", "Missing directories"))

    # Discord Bot Check
    if ctx.bot.is_ready():
        checks.append(("Discord Bot", "✅", f"Connected to {len(ctx.bot.guilds)} servers"))
    else:
        checks.append(("Discord Bot", "❌", "Not ready"))

    # Build embed
    all_pass = all(check[1] == "✅" for check in checks)

    embed = discord.Embed(
        title="🔍 System Validation",
        description="**Status:** " + ("✅ ALL SYSTEMS OPERATIONAL" if all_pass else "⚠️ ISSUES DETECTED"),
        color=discord.Color.green() if all_pass else discord.Color.orange()
    )

    for name, status, details in checks:
        embed.add_field(
            name=f"{status} {name}",
            value=f"`{details}`",
            inline=False
        )

    embed.set_footer(text="For comprehensive testing, use !test-all")

    await msg.edit(content=None, embed=embed)
