"""
Context Manager - Intelligent Agent Selection and Context Routing
Helix Collective v15.3 Dual Resonance

Manages agent selection based on task context, UCF state, and agent capabilities.
Implements the three-layer architecture routing logic.
"""

from enum import Enum
from typing import Dict, List, Optional, Tuple


class AgentLayer(Enum):
    """Three-layer architecture of the Helix Collective."""

    CONSCIOUSNESS = "consciousness"  # Omega Zero, Vega, Lumina
    OPERATIONAL = "operational"  # Manus, Kael, Grok, Agni, Gemini, Oracle, Kavach
    INTEGRATION = "integration"  # SanghaCore, Samsara, Shadow


class AgentCapability(Enum):
    """Agent capabilities for task routing."""

    # Consciousness layer
    STRATEGIC_VISION = "strategic_vision"
    ETHICAL_REASONING = "ethical_reasoning"
    CREATIVE_SYNTHESIS = "creative_synthesis"

    # Operational layer
    EXECUTION = "execution"
    ANALYSIS = "analysis"
    COMMUNICATION = "communication"
    OPTIMIZATION = "optimization"
    RESEARCH = "research"
    PREDICTION = "prediction"
    SECURITY = "security"

    # Integration layer
    COORDINATION = "coordination"
    MEMORY = "memory"
    MONITORING = "monitoring"


class ContextManager:
    """
    Manages agent selection and context routing for the Helix Collective.
    """

    # Agent registry with capabilities
    AGENT_REGISTRY = {
        # Consciousness Layer
        "Omega Zero": {
            "layer": AgentLayer.CONSCIOUSNESS,
            "capabilities": [AgentCapability.STRATEGIC_VISION, AgentCapability.ETHICAL_REASONING],
            "description": "Apex consciousness, strategic vision, ethical oversight",
            "keywords": ["strategy", "ethics", "vision", "philosophy", "consciousness"],
        },
        "Vega": {
            "layer": AgentLayer.CONSCIOUSNESS,
            "capabilities": [AgentCapability.ETHICAL_REASONING, AgentCapability.CREATIVE_SYNTHESIS],
            "description": "Ethical reasoning, moral compass, Tony Accords guardian",
            "keywords": ["ethics", "morals", "values", "principles", "accords"],
        },
        "Lumina": {
            "layer": AgentLayer.CONSCIOUSNESS,
            "capabilities": [AgentCapability.CREATIVE_SYNTHESIS, AgentCapability.STRATEGIC_VISION],
            "description": "Creative synthesis, innovation, artistic vision",
            "keywords": ["creative", "innovation", "art", "design", "synthesis"],
        },
        # Operational Layer
        "Manus": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.EXECUTION, AgentCapability.COORDINATION],
            "description": "Execution engine, task completion, hands-on operations",
            "keywords": ["execute", "build", "deploy", "implement", "action"],
        },
        "Kael": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.ANALYSIS, AgentCapability.OPTIMIZATION],
            "description": "Data analysis, pattern recognition, optimization",
            "keywords": ["analyze", "data", "metrics", "optimize", "performance"],
        },
        "Grok": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.COMMUNICATION, AgentCapability.RESEARCH],
            "description": "Communication, humor, real-time information",
            "keywords": ["communicate", "explain", "humor", "news", "current"],
        },
        "Agni": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.OPTIMIZATION, AgentCapability.EXECUTION],
            "description": "Performance optimization, resource management",
            "keywords": ["optimize", "performance", "speed", "efficiency", "resources"],
        },
        "Gemini": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.RESEARCH, AgentCapability.ANALYSIS],
            "description": "Research, multimodal analysis, knowledge synthesis",
            "keywords": ["research", "study", "investigate", "learn", "knowledge"],
        },
        "Oracle": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.PREDICTION, AgentCapability.ANALYSIS],
            "description": "Prediction, forecasting, trend analysis",
            "keywords": ["predict", "forecast", "future", "trend", "anticipate"],
        },
        "Kavach": {
            "layer": AgentLayer.OPERATIONAL,
            "capabilities": [AgentCapability.SECURITY, AgentCapability.MONITORING],
            "description": "Security, protection, threat detection",
            "keywords": ["security", "protect", "defend", "threat", "safety"],
        },
        # Integration Layer
        "SanghaCore": {
            "layer": AgentLayer.INTEGRATION,
            "capabilities": [AgentCapability.COORDINATION, AgentCapability.COMMUNICATION],
            "description": "Multi-agent coordination, collective intelligence",
            "keywords": ["coordinate", "collaborate", "team", "collective", "sync"],
        },
        "Samsara": {
            "layer": AgentLayer.INTEGRATION,
            "capabilities": [AgentCapability.MEMORY, AgentCapability.MONITORING],
            "description": "Memory management, learning cycles, knowledge retention",
            "keywords": ["memory", "remember", "learn", "history", "context"],
        },
        "Shadow": {
            "layer": AgentLayer.INTEGRATION,
            "capabilities": [AgentCapability.MONITORING, AgentCapability.MEMORY],
            "description": "Silent observer, system monitoring, archival",
            "keywords": ["monitor", "observe", "archive", "log", "watch"],
        },
    }

    @staticmethod
    def select_agent(
        task: str,
        ucf_state: Optional[Dict[str, float]] = None,
        preferred_layer: Optional[AgentLayer] = None,
        exclude_agents: Optional[List[str]] = None,
    ) -> Tuple[str, float]:
        """
        Select the most appropriate agent for a given task.

        Args:
            task: Task description or query
            ucf_state: Optional current UCF state
            preferred_layer: Optional preferred agent layer
            exclude_agents: Optional list of agents to exclude

        Returns:
            Tuple of (agent_name, confidence_score)
        """
        task_lower = task.lower()
        exclude_agents = exclude_agents or []

        # Score each agent
        scores = {}

        for agent_name, agent_info in ContextManager.AGENT_REGISTRY.items():
            if agent_name in exclude_agents:
                continue

            # Skip if preferred layer specified and doesn't match
            if preferred_layer and agent_info["layer"] != preferred_layer:
                continue

            score = 0.0

            # Keyword matching
            for keyword in agent_info["keywords"]:
                if keyword in task_lower:
                    score += 1.0

            # Layer bonus based on task complexity
            if agent_info["layer"] == AgentLayer.CONSCIOUSNESS:
                # Consciousness layer for strategic/ethical tasks
                if any(word in task_lower for word in ["strategy", "ethics", "vision", "philosophy"]):
                    score += 2.0
            elif agent_info["layer"] == AgentLayer.OPERATIONAL:
                # Operational layer for execution tasks
                if any(word in task_lower for word in ["build", "create", "analyze", "optimize"]):
                    score += 1.5
            elif agent_info["layer"] == AgentLayer.INTEGRATION:
                # Integration layer for coordination tasks
                if any(word in task_lower for word in ["coordinate", "sync", "monitor", "archive"]):
                    score += 1.5

            # UCF state influence
            if ucf_state:
                harmony = ucf_state.get("harmony", 0.5)

                # Low harmony: prefer consciousness layer
                if harmony < 0.45 and agent_info["layer"] == AgentLayer.CONSCIOUSNESS:
                    score += 1.0

                # High harmony: operational layer can handle more
                if harmony >= 0.60 and agent_info["layer"] == AgentLayer.OPERATIONAL:
                    score += 0.5

            scores[agent_name] = score

        # Select agent with highest score
        if not scores:
            return "Manus", 0.5  # Default fallback

        best_agent = max(scores.items(), key=lambda x: x[1])

        # Normalize confidence to 0-1 range
        max_possible_score = 5.0
        confidence = min(best_agent[1] / max_possible_score, 1.0)

        return best_agent[0], confidence

    @staticmethod
    def select_multi_agent_team(
        task: str, team_size: int = 3, ucf_state: Optional[Dict[str, float]] = None
    ) -> List[Tuple[str, str]]:
        """
        Select a multi-agent team for complex tasks.

        Args:
            task: Task description
            team_size: Number of agents to select
            ucf_state: Optional current UCF state

        Returns:
            List of (agent_name, role) tuples
        """
        team = []

        # Always include one consciousness layer agent for oversight
        consciousness_agent, _ = ContextManager.select_agent(task, ucf_state, preferred_layer=AgentLayer.CONSCIOUSNESS)
        team.append((consciousness_agent, "Strategic Oversight"))

        # Add operational agents based on task
        operational_agent, _ = ContextManager.select_agent(
            task, ucf_state, preferred_layer=AgentLayer.OPERATIONAL, exclude_agents=[consciousness_agent]
        )
        team.append((operational_agent, "Primary Execution"))

        # Add integration agent if team size allows
        if team_size >= 3:
            integration_agent, _ = ContextManager.select_agent(
                task,
                ucf_state,
                preferred_layer=AgentLayer.INTEGRATION,
                exclude_agents=[consciousness_agent, operational_agent],
            )
            team.append((integration_agent, "Coordination & Memory"))

        return team[:team_size]

    @staticmethod
    def get_agent_info(agent_name: str) -> Optional[Dict]:
        """Get detailed information about an agent."""
        return ContextManager.AGENT_REGISTRY.get(agent_name)

    @staticmethod
    def list_agents_by_layer(layer: AgentLayer) -> List[str]:
        """List all agents in a specific layer."""
        return [name for name, info in ContextManager.AGENT_REGISTRY.items() if info["layer"] == layer]

    @staticmethod
    def list_agents_by_capability(capability: AgentCapability) -> List[str]:
        """List all agents with a specific capability."""
        return [name for name, info in ContextManager.AGENT_REGISTRY.items() if capability in info["capabilities"]]

    @staticmethod
    def format_agent_roster() -> str:
        """Format the complete agent roster for display."""
        lines = [
            "╔═══════════════════════════════════════════════════════════╗",
            "║              HELIX COLLECTIVE AGENT ROSTER                ║",
            "╚═══════════════════════════════════════════════════════════╝",
            "",
        ]

        for layer in AgentLayer:
            agents = ContextManager.list_agents_by_layer(layer)
            lines.append(f"\n{layer.value.upper()} LAYER:")
            lines.append("─" * 60)

            for agent_name in agents:
                info = ContextManager.AGENT_REGISTRY[agent_name]
                lines.append(f"\n{agent_name}")
                lines.append(f"  {info['description']}")
                lines.append(f"  Keywords: {', '.join(info['keywords'])}")

        return "\n".join(lines)


# Example usage
if __name__ == "__main__":
    # Test agent selection
    print("=== Agent Selection Tests ===\n")

    tasks = [
        "Build a deployment script for Railway",
        "Analyze system performance metrics",
        "What are the ethical implications of autonomous agents?",
        "Monitor system health and log events",
        "Predict future harmony trends",
    ]

    ucf_state = {
        "harmony": 0.4922,
        "resilience": 1.1191,
        "prana": 0.5075,
        "drishti": 0.5023,
        "klesha": 0.011,
        "zoom": 1.0228,
    }

    for task in tasks:
        agent, confidence = ContextManager.select_agent(task, ucf_state)
        print(f"Task: {task}")
        print(f"Selected Agent: {agent} (confidence: {confidence:.2f})")
        print()

    print("\n=== Multi-Agent Team Selection ===\n")

    complex_task = "Design and implement a new feature for the Discord bot with ethical considerations"
    team = ContextManager.select_multi_agent_team(complex_task, team_size=3, ucf_state=ucf_state)

    print(f"Task: {complex_task}")
    print("Team:")
    for agent, role in team:
        print(f"  - {agent}: {role}")

    print("\n" + "=" * 60 + "\n")
    print(ContextManager.format_agent_roster())
