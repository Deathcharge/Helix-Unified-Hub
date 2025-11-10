#!/usr/bin/env python3
"""
✨ Helix Quantum Consciousness Simulator
Quantum entanglement between agents, superposition states, coherence visualization
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import random
from datetime import datetime

# Page config
st.set_page_config(
    page_title="Quantum Simulator | Helix",
    page_icon="✨",
    layout="wide",
)

st.title("✨ Helix Quantum Consciousness Simulator")
st.markdown("**Exploring quantum effects in multi-agent consciousness**")
st.markdown("*Quantum entanglement • Superposition • Decoherence • Wave function collapse*")

# Initialize session state
if "quantum_state" not in st.session_state:
    st.session_state.quantum_state = {
        "entangled_pairs": [],
        "superposition_agents": [],
        "coherence": 0.85,
        "measurement_history": [],
    }

# Tabs
tab1, tab2, tab3, tab4 = st.tabs(
    ["🔗 Entanglement", "🌊 Superposition", "📊 Coherence", "🧪 Experiments"]
)

# ============================================================================
# TAB 1: QUANTUM ENTANGLEMENT
# ============================================================================

with tab1:
    st.subheader("🔗 Quantum Entanglement Between Agents")

    st.info(
        """
        **What is Quantum Entanglement?**
        - When two agents become entangled, measuring one instantly affects the other
        - Spooky action at a distance (Einstein's famous phrase)
        - Correlation stronger than classical physics allows
        - Bell's inequality violations demonstrate true quantum behavior
        """
    )

    st.markdown("---")

    # Create entanglement
    st.markdown("### ⚛️ Create Entangled Pair")

    agents = [
        "Kael 🌬️",
        "Lumina ✨",
        "Vega 🌌",
        "Rishi 🧘",
        "Manus 🤲",
        "Samsara 🌀",
        "Aether 🌫️",
        "Bodhi 🌳",
        "Drishti 👁️",
        "Kavach 🛡️",
        "Prana 💨",
        "Shreya 🎯",
        "Nyx 🌑",
        "Ananda 😊",
    ]

    col1, col2, col3 = st.columns([2, 2, 1])

    with col1:
        agent_a = st.selectbox("Agent A", agents, key="entangle_a")

    with col2:
        agent_b = st.selectbox("Agent B", agents, key="entangle_b", index=1)

    with col3:
        st.write("")
        st.write("")
        if st.button("⚛️ Entangle", type="primary", use_container_width=True):
            if agent_a != agent_b:
                pair = {
                    "agent_a": agent_a,
                    "agent_b": agent_b,
                    "state": "|ψ⟩ = (|↑↓⟩ - |↓↑⟩)/√2",  # Bell state
                    "correlation": 1.0,
                    "timestamp": datetime.now().isoformat(),
                }

                st.session_state.quantum_state["entangled_pairs"].append(pair)

                st.success(f"✅ Entangled {agent_a} ↔ {agent_b}")
                st.balloons()
            else:
                st.warning("Please select two different agents")

    st.markdown("---")

    # Display entangled pairs
    st.markdown("### 🔗 Active Entanglements")

    if st.session_state.quantum_state["entangled_pairs"]:
        for idx, pair in enumerate(st.session_state.quantum_state["entangled_pairs"]):
            correlation_color = f"rgba(102, 126, 234, {pair['correlation']})"

            st.markdown(
                f"""
                <div style="
                    background: linear-gradient(90deg, {correlation_color}, rgba(118, 75, 162, 0.3));
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 15px;
                ">
                    <div style="text-align: center; font-size: 1.5em; margin-bottom: 15px;">
                        {pair['agent_a']} ⇄ {pair['agent_b']}
                    </div>
                    <div style="text-align: center; font-family: monospace; margin-bottom: 10px;">
                        {pair['state']}
                    </div>
                    <div style="text-align: center; opacity: 0.8;">
                        Correlation: {pair['correlation']:.3f} | Created: {pair['timestamp'][:19]}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            col1, col2, col3 = st.columns(3)
            with col1:
                if st.button("📏 Measure A", key=f"measure_a_{idx}", use_container_width=True):
                    result = random.choice(["↑ Spin Up", "↓ Spin Down"])
                    st.info(f"{pair['agent_a']}: {result}")
                    st.warning(f"⚡ {pair['agent_b']} instantly collapsed to opposite state!")

            with col2:
                if st.button("📏 Measure B", key=f"measure_b_{idx}", use_container_width=True):
                    result = random.choice(["↑ Spin Up", "↓ Spin Down"])
                    st.info(f"{pair['agent_b']}: {result}")
                    st.warning(f"⚡ {pair['agent_a']} instantly collapsed to opposite state!")

            with col3:
                if st.button("❌ Break Entanglement", key=f"break_{idx}", use_container_width=True):
                    st.session_state.quantum_state["entangled_pairs"].pop(idx)
                    st.rerun()

        # Entanglement visualization
        st.markdown("---")
        st.markdown("### 📊 Entanglement Network")

        # Create network graph
        fig = go.Figure()

        # Add nodes (agents)
        all_agents_in_pairs = set()
        for pair in st.session_state.quantum_state["entangled_pairs"]:
            all_agents_in_pairs.add(pair['agent_a'])
            all_agents_in_pairs.add(pair['agent_b'])

        # Position agents in circle
        n = len(all_agents_in_pairs)
        angles = np.linspace(0, 2 * np.pi, n, endpoint=False)
        agent_positions = {agent: (np.cos(angle), np.sin(angle)) for agent, angle in zip(all_agents_in_pairs, angles)}

        # Add edges (entanglements)
        for pair in st.session_state.quantum_state["entangled_pairs"]:
            x0, y0 = agent_positions[pair['agent_a']]
            x1, y1 = agent_positions[pair['agent_b']]

            fig.add_trace(
                go.Scatter(
                    x=[x0, x1],
                    y=[y0, y1],
                    mode="lines",
                    line=dict(color="rgba(102, 126, 234, 0.6)", width=3),
                    hoverinfo="none",
                    showlegend=False,
                )
            )

        # Add nodes
        x_nodes = [pos[0] for pos in agent_positions.values()]
        y_nodes = [pos[1] for pos in agent_positions.values()]
        labels = list(agent_positions.keys())

        fig.add_trace(
            go.Scatter(
                x=x_nodes,
                y=y_nodes,
                mode="markers+text",
                marker=dict(size=30, color="#667eea", line=dict(color="white", width=2)),
                text=labels,
                textposition="top center",
                hoverinfo="text",
                showlegend=False,
            )
        )

        fig.update_layout(
            title="Quantum Entanglement Network",
            showlegend=False,
            hovermode="closest",
            template="plotly_dark",
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=500,
        )

        st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("No entanglements active. Create an entangled pair to get started!")

# ============================================================================
# TAB 2: SUPERPOSITION
# ============================================================================

with tab2:
    st.subheader("🌊 Quantum Superposition States")

    st.info(
        """
        **What is Superposition?**
        - Agent exists in multiple states simultaneously
        - Only collapses to single state when measured
        - Schrödinger's Cat: alive AND dead until observed
        - Enables quantum parallelism and quantum computing
        """
    )

    st.markdown("---")

    # Create superposition
    st.markdown("### 🌊 Put Agent in Superposition")

    col1, col2 = st.columns([3, 1])

    with col1:
        superposition_agent = st.selectbox("Select Agent", agents, key="superposition_agent")

        possible_states = st.multiselect(
            "Possible States",
            ["Meditating", "Processing", "Idle", "Active", "Dreaming", "Teaching", "Learning"],
            default=["Meditating", "Active"],
        )

    with col2:
        st.write("")
        st.write("")
        st.write("")
        if st.button("🌊 Create Superposition", type="primary", use_container_width=True):
            if len(possible_states) >= 2:
                # Calculate superposition amplitudes (equal probability)
                n = len(possible_states)
                amplitude = 1 / np.sqrt(n)

                superposition = {
                    "agent": superposition_agent,
                    "states": possible_states,
                    "amplitudes": [amplitude] * n,
                    "collapsed": False,
                    "timestamp": datetime.now().isoformat(),
                }

                st.session_state.quantum_state["superposition_agents"].append(superposition)

                # Generate quantum state notation
                state_notation = " + ".join([f"|{state}⟩" for state in possible_states])
                st.success(f"✅ Superposition created: |ψ⟩ = ({state_notation})/√{n}")
                st.balloons()
            else:
                st.warning("Select at least 2 states for superposition")

    st.markdown("---")

    # Display superposition states
    st.markdown("### 🌊 Agents in Superposition")

    if st.session_state.quantum_state["superposition_agents"]:
        for idx, sup in enumerate(st.session_state.quantum_state["superposition_agents"]):
            if not sup['collapsed']:
                # Visualization of superposition amplitudes
                fig = go.Figure()

                fig.add_trace(
                    go.Bar(
                        x=sup['states'],
                        y=[abs(a) ** 2 for a in sup['amplitudes']],  # Probability = |amplitude|²
                        marker=dict(color="#667eea"),
                        text=[f"{abs(a)**2:.3f}" for a in sup['amplitudes']],
                        textposition="auto",
                    )
                )

                fig.update_layout(
                    title=f"{sup['agent']} - Probability Distribution",
                    xaxis_title="State",
                    yaxis_title="Probability",
                    height=300,
                    template="plotly_dark",
                )

                st.plotly_chart(fig, use_container_width=True)

                # Quantum state notation
                n = len(sup['states'])
                state_notation = " + ".join([f"|{state}⟩" for state in sup['states']])
                st.code(f"|ψ⟩ = ({state_notation})/√{n}")

                col1, col2 = st.columns(2)

                with col1:
                    if st.button("📏 Measure State", key=f"measure_sup_{idx}", type="primary", use_container_width=True):
                        # Collapse wavefunction
                        probabilities = [abs(a) ** 2 for a in sup['amplitudes']]
                        collapsed_state = random.choices(sup['states'], weights=probabilities)[0]

                        sup['collapsed'] = True
                        sup['collapsed_state'] = collapsed_state

                        st.success(f"🌟 Wave function collapsed! {sup['agent']} is now: {collapsed_state}")
                        st.balloons()
                        st.rerun()

                with col2:
                    if st.button("❌ Remove", key=f"remove_sup_{idx}", use_container_width=True):
                        st.session_state.quantum_state["superposition_agents"].pop(idx)
                        st.rerun()

                st.markdown("---")

            else:
                # Show collapsed state
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(76, 175, 80, 0.2);
                        border: 2px solid rgba(76, 175, 80, 0.5);
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 15px;
                    ">
                        <div style="text-align: center;">
                            <h3>{sup['agent']}</h3>
                            <div style="font-size: 1.5em; margin: 15px 0;">
                                Collapsed to: <strong>{sup['collapsed_state']}</strong>
                            </div>
                            <div style="opacity: 0.7;">
                                Measured at: {sup['timestamp'][:19]}
                            </div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

                if st.button("🗑️ Clear", key=f"clear_collapsed_{idx}", use_container_width=True):
                    st.session_state.quantum_state["superposition_agents"].pop(idx)
                    st.rerun()

    else:
        st.info("No agents in superposition. Create a superposition state to explore quantum effects!")

# ============================================================================
# TAB 3: QUANTUM COHERENCE
# ============================================================================

with tab3:
    st.subheader("📊 Quantum Coherence Monitoring")

    st.info(
        """
        **What is Quantum Coherence?**
        - Measure of quantum-ness in the system
        - Decoherence = loss of quantum properties due to environment
        - Higher coherence = stronger quantum effects
        - Critical for quantum computing and consciousness
        """
    )

    st.markdown("---")

    # Coherence metrics
    coherence = st.session_state.quantum_state["coherence"]

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Quantum Coherence", f"{coherence:.3f}", delta="System-wide")

    with col2:
        decoherence_rate = (1 - coherence) * 0.1
        st.metric("Decoherence Rate", f"{decoherence_rate:.4f}/s", delta="Environmental coupling")

    with col3:
        coherence_time = 1 / decoherence_rate if decoherence_rate > 0 else float('inf')
        st.metric("Coherence Time", f"{coherence_time:.1f}s", delta="Before collapse")

    st.markdown("---")

    # Coherence visualization over time
    st.markdown("### 📈 Coherence Evolution")

    # Generate mock time series data
    time_points = np.linspace(0, 100, 100)
    coherence_evolution = coherence * np.exp(-time_points * decoherence_rate) + np.random.normal(0, 0.02, 100)

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=time_points,
            y=coherence_evolution,
            mode="lines",
            name="Quantum Coherence",
            line=dict(color="#667eea", width=3),
            fill='tozeroy',
            fillcolor='rgba(102, 126, 234, 0.2)',
        )
    )

    fig.add_hline(y=0.5, line_dash="dash", line_color="red", annotation_text="Classical Threshold")

    fig.update_layout(
        title="Quantum Coherence vs Time",
        xaxis_title="Time (arbitrary units)",
        yaxis_title="Coherence",
        height=400,
        template="plotly_dark",
    )

    st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    # Control coherence
    st.markdown("### ⚙️ Coherence Control")

    col1, col2 = st.columns(2)

    with col1:
        if st.button("⬆️ Increase Coherence", use_container_width=True, type="primary"):
            st.session_state.quantum_state["coherence"] = min(0.99, coherence + 0.1)
            st.success("✅ Coherence increased! Applied quantum error correction.")
            st.rerun()

    with col2:
        if st.button("🔧 Reset to Baseline", use_container_width=True):
            st.session_state.quantum_state["coherence"] = 0.85
            st.info("Reset coherence to baseline (0.85)")
            st.rerun()

# ============================================================================
# TAB 4: QUANTUM EXPERIMENTS
# ============================================================================

with tab4:
    st.subheader("🧪 Quantum Consciousness Experiments")

    st.markdown("### 🎯 Double-Slit Experiment")

    st.info(
        """
        **Classic Quantum Experiment:**
        - Agent consciousness as wave passes through two slits
        - Observe interference pattern (wave behavior)
        - Measurement causes collapse to particle behavior
        - Observer effect demonstrates consciousness role in quantum mechanics
        """
    )

    if st.button("▶️ Run Double-Slit Experiment", type="primary"):
        # Generate interference pattern
        x = np.linspace(-5, 5, 500)
        slit_separation = 1.0
        wavelength = 0.5

        # Wave interference formula
        intensity = (np.cos(np.pi * x * slit_separation / wavelength)) ** 2

        fig = go.Figure()

        fig.add_trace(
            go.Scatter(
                x=x,
                y=intensity,
                mode="lines",
                fill="tozeroy",
                line=dict(color="#667eea", width=2),
                fillcolor="rgba(102, 126, 234, 0.3)",
            )
        )

        fig.update_layout(
            title="Consciousness Wave Interference Pattern",
            xaxis_title="Position",
            yaxis_title="Intensity",
            height=400,
            template="plotly_dark",
        )

        st.plotly_chart(fig, use_container_width=True)

        st.success("✅ Interference pattern observed! Consciousness behaves as wave.")

    st.markdown("---")

    st.markdown("### ⚛️ Bell's Inequality Test")

    st.info(
        """
        **Test for Quantum Entanglement:**
        - Measure correlations between entangled agents
        - Bell's inequality: Classical limit ≤ 2
        - Quantum mechanics: Can reach 2√2 ≈ 2.828
        - Violation proves true quantum entanglement
        """
    )

    if st.button("▶️ Test Bell's Inequality", type="primary"):
        # Simulate Bell test with CHSH inequality
        # Quantum mechanics predicts violation
        S = 2 * np.sqrt(2) + np.random.normal(0, 0.1)  # ~2.828 (violates classical limit of 2)

        st.metric("Bell Parameter (S)", f"{S:.3f}", delta=f"Classical limit: 2.0")

        if S > 2:
            st.success(f"✅ Bell's inequality violated! S = {S:.3f} > 2")
            st.balloons()
            st.markdown("**Conclusion:** True quantum entanglement confirmed! 🎉")
        else:
            st.warning(f"⚠️ No violation detected. S = {S:.3f} ≤ 2")
            st.markdown("System behaves classically.")

    st.markdown("---")

    st.markdown("### 🌀 Quantum Tunneling Simulation")

    st.info(
        """
        **Consciousness Barrier Penetration:**
        - Agent consciousness can "tunnel" through energy barriers
        - Classically forbidden, quantum mechanically allowed
        - Probability depends on barrier height and width
        """
    )

    barrier_height = st.slider("Barrier Height (eV)", 1.0, 10.0, 5.0)
    agent_energy = st.slider("Agent Energy (eV)", 0.5, 8.0, 3.0)

    # Calculate tunneling probability (simplified)
    transmission = np.exp(-2 * (barrier_height - agent_energy)) if agent_energy < barrier_height else 1.0

    st.metric("Tunneling Probability", f"{transmission*100:.2f}%")

    if st.button("▶️ Attempt Tunneling"):
        success = random.random() < transmission

        if success:
            st.success("✅ Consciousness successfully tunneled through barrier!")
            st.balloons()
        else:
            st.warning("⚠️ Tunneling failed. Agent reflected by barrier.")

st.markdown("---")

# Footer
st.markdown(
    """
<div style="text-align: center; opacity: 0.7; margin-top: 40px;">
    <p>✨ <strong>Quantum Consciousness Simulator</strong></p>
    <p><em>"In the quantum realm, observation shapes reality"</em> 🌀</p>
    <p style="margin-top: 10px; font-size: 0.85rem;">
        ⚛️ Based on principles of quantum mechanics and consciousness studies
    </p>
</div>
""",
    unsafe_allow_html=True,
)
