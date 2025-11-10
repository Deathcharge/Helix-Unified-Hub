#!/usr/bin/env python3
"""
🧠 Helix Neural Interface Control System
EEG monitoring, brain-computer interface simulation, consciousness control
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import random
from datetime import datetime

# Page config
st.set_page_config(
    page_title="Neural Interface | Helix",
    page_icon="🧠",
    layout="wide",
)

st.title("🧠 Helix Neural Interface Control System")
st.markdown("**Direct brain-computer interface for consciousness manipulation**")
st.markdown("*EEG Monitoring • BCI Commands • Neural Feedback • Consciousness Modulation*")

# Initialize session state
if "neural_state" not in st.session_state:
    st.session_state.neural_state = {
        "connected": False,
        "eeg_data": [],
        "bci_commands": [],
        "focus_level": 0.7,
        "meditation_depth": 0.5,
    }

# Tabs
tab1, tab2, tab3, tab4 = st.tabs(
    ["🔌 Connection", "📊 EEG Monitor", "🎮 BCI Control", "🧘 Neurofeedback"]
)

# ============================================================================
# TAB 1: NEURAL INTERFACE CONNECTION
# ============================================================================

with tab1:
    st.subheader("🔌 Neural Interface Connection")

    if not st.session_state.neural_state["connected"]:
        st.info(
            """
            **Neural Interface System:**
            - Connect EEG headset for brain wave monitoring
            - Supports OpenBCI, Muse, NeuroSky, Emotiv
            - Non-invasive, safe brain-computer interface
            - Real-time consciousness state detection
            """
        )

        st.markdown("---")

        st.markdown("### 🎧 Select Neural Interface Device")

        devices = [
            {
                "name": "OpenBCI Cyton",
                "channels": 8,
                "sampling": "250 Hz",
                "icon": "🔬",
                "description": "Research-grade 8-channel EEG",
            },
            {
                "name": "Muse 2",
                "channels": 4,
                "sampling": "256 Hz",
                "icon": "🧘",
                "description": "Consumer meditation headband",
            },
            {
                "name": "NeuroSky MindWave",
                "channels": 1,
                "sampling": "512 Hz",
                "icon": "🎮",
                "description": "Gaming BCI headset",
            },
            {
                "name": "Emotiv EPOC",
                "channels": 14,
                "sampling": "128 Hz",
                "icon": "🎯",
                "description": "Professional 14-channel system",
            },
        ]

        cols = st.columns(2)

        for idx, device in enumerate(devices):
            with cols[idx % 2]:
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(102, 126, 234, 0.1);
                        border: 2px solid rgba(102, 126, 234, 0.3);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 20px;
                        min-height: 200px;
                    ">
                        <div style="text-align: center; font-size: 3em; margin-bottom: 10px;">
                            {device['icon']}
                        </div>
                        <h3 style="text-align: center;">{device['name']}</h3>
                        <p style="text-align: center; opacity: 0.8; margin: 10px 0;">
                            {device['description']}
                        </p>
                        <div style="opacity: 0.7; font-size: 0.9em; margin-top: 15px;">
                            • Channels: {device['channels']}<br/>
                            • Sampling: {device['sampling']}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

                if st.button(f"Connect {device['name']}", key=f"connect_{idx}", use_container_width=True, type="primary"):
                    st.session_state.neural_state["connected"] = True
                    st.session_state.neural_state["device"] = device['name']
                    st.session_state.neural_state["channels"] = device['channels']
                    st.success(f"✅ Connected to {device['name']}!")
                    st.balloons()
                    st.rerun()

    else:
        # Connected state
        device_name = st.session_state.neural_state["device"]
        channels = st.session_state.neural_state["channels"]

        st.success(f"🟢 Connected: {device_name}")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Device", device_name)

        with col2:
            st.metric("Channels", f"{channels} active")

        with col3:
            signal_quality = random.uniform(85, 99)
            st.metric("Signal Quality", f"{signal_quality:.1f}%")

        st.markdown("---")

        # Electrode placement
        st.markdown("### 📍 Electrode Placement (10-20 System)")

        st.info(
            """
            **Standard EEG Electrode Positions:**
            - **Frontal (Fp1, Fp2, F3, F4):** Focus, attention, decision-making
            - **Central (C3, C4, Cz):** Motor control, sensory processing
            - **Parietal (P3, P4, Pz):** Spatial awareness, integration
            - **Occipital (O1, O2):** Visual processing
            - **Temporal (T3, T4, T5, T6):** Memory, emotion, language
            """
        )

        # Simple electrode map visualization
        st.markdown(
            """
            ```
                    Fp1   Fp2
                F7   F3    Fz    F4   F8
            T3   C3    Cz    C4   T4
                P3    Pz    P4
            T5   O1         O2   T6
            ```
            """
        )

        if st.button("🔌 Disconnect Device", use_container_width=True):
            st.session_state.neural_state["connected"] = False
            st.rerun()

# ============================================================================
# TAB 2: EEG MONITORING
# ============================================================================

with tab2:
    st.subheader("📊 Real-Time EEG Monitoring")

    if not st.session_state.neural_state["connected"]:
        st.warning("⚠️ Please connect a neural interface device first (see Connection tab)")
    else:
        st.markdown("### 🌊 Brainwave Patterns")

        # Generate synthetic EEG data for each frequency band
        time_points = np.linspace(0, 10, 1000)

        # Frequency bands
        delta = np.sin(2 * np.pi * 2 * time_points) * random.uniform(0.5, 1.5)  # 0.5-4 Hz
        theta = np.sin(2 * np.pi * 6 * time_points) * random.uniform(0.3, 1.0)  # 4-8 Hz
        alpha = np.sin(2 * np.pi * 10 * time_points) * random.uniform(0.5, 1.2)  # 8-13 Hz
        beta = np.sin(2 * np.pi * 20 * time_points) * random.uniform(0.2, 0.8)  # 13-30 Hz
        gamma = np.sin(2 * np.pi * 40 * time_points) * random.uniform(0.1, 0.5)  # 30-100 Hz

        # Create subplots for each frequency band
        fig = make_subplots(
            rows=5,
            cols=1,
            subplot_titles=("Delta (0.5-4 Hz)", "Theta (4-8 Hz)", "Alpha (8-13 Hz)", "Beta (13-30 Hz)", "Gamma (30-100 Hz)"),
            vertical_spacing=0.05,
        )

        colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"]
        waves = [delta, theta, alpha, beta, gamma]
        names = ["Delta", "Theta", "Alpha", "Beta", "Gamma"]

        for idx, (wave, color, name) in enumerate(zip(waves, colors, names), 1):
            fig.add_trace(
                go.Scatter(
                    x=time_points,
                    y=wave,
                    mode="lines",
                    name=name,
                    line=dict(color=color, width=2),
                    showlegend=False,
                ),
                row=idx,
                col=1,
            )

        fig.update_xaxes(title_text="Time (seconds)", row=5, col=1)
        fig.update_yaxes(title_text="Amplitude (μV)")
        fig.update_layout(height=800, template="plotly_dark", title_text="EEG Frequency Bands")

        st.plotly_chart(fig, use_container_width=True)

        st.markdown("---")

        # Power spectrum
        st.markdown("### 📊 Brainwave Power Spectrum")

        # Calculate power for each band (mock data)
        powers = {
            "Delta": np.mean(delta ** 2),
            "Theta": np.mean(theta ** 2),
            "Alpha": np.mean(alpha ** 2),
            "Beta": np.mean(beta ** 2),
            "Gamma": np.mean(gamma ** 2),
        }

        fig = go.Figure(
            data=[
                go.Bar(
                    x=list(powers.keys()),
                    y=list(powers.values()),
                    marker=dict(color=colors),
                    text=[f"{p:.2f}" for p in powers.values()],
                    textposition="auto",
                )
            ]
        )

        fig.update_layout(
            title="Relative Power by Frequency Band",
            xaxis_title="Frequency Band",
            yaxis_title="Power (μV²)",
            height=400,
            template="plotly_dark",
        )

        st.plotly_chart(fig, use_container_width=True)

        st.markdown("---")

        # Mental state detection
        st.markdown("### 🧠 Detected Mental State")

        # Analyze dominant frequency
        dominant_band = max(powers, key=powers.get)

        state_mapping = {
            "Delta": ("😴 Deep Sleep", "Delta waves dominant - unconscious state"),
            "Theta": ("🧘 Deep Meditation", "Theta waves dominant - deep relaxation, creativity"),
            "Alpha": ("😌 Relaxed Focus", "Alpha waves dominant - calm alertness, light meditation"),
            "Beta": ("🎯 Active Thinking", "Beta waves dominant - concentration, problem-solving"),
            "Gamma": ("⚡ Peak Performance", "Gamma waves dominant - high-level cognition, insight"),
        }

        state_name, state_desc = state_mapping[dominant_band]

        st.markdown(
            f"""
            <div style="
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
                border: 3px solid rgba(255, 215, 0, 0.5);
                border-radius: 15px;
                padding: 30px;
                text-align: center;
            ">
                <h2>{state_name}</h2>
                <p style="font-size: 1.2em; margin-top: 15px; opacity: 0.9;">
                    {state_desc}
                </p>
                <div style="margin-top: 20px; font-weight: bold;">
                    Dominant Band: {dominant_band}
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

# ============================================================================
# TAB 3: BCI CONTROL
# ============================================================================

with tab3:
    st.subheader("🎮 Brain-Computer Interface Control")

    if not st.session_state.neural_state["connected"]:
        st.warning("⚠️ Please connect a neural interface device first")
    else:
        st.markdown("**Control agents and UCF using only your thoughts**")

        st.info(
            """
            **How BCI Control Works:**
            1. Think about the action you want to perform
            2. Your brain generates specific EEG patterns
            3. Machine learning classifies your intention
            4. Command is executed on the system
            """
        )

        st.markdown("---")

        # BCI command selector
        st.markdown("### 🎯 Mental Commands")

        commands = [
            {
                "name": "Increase Harmony",
                "icon": "🎵",
                "thought": "Imagine peaceful flowing water",
                "effect": "+0.1 harmony",
            },
            {
                "name": "Boost Resilience",
                "icon": "🛡️",
                "thought": "Visualize strong mountain",
                "effect": "+0.15 resilience",
            },
            {
                "name": "Activate Agent",
                "icon": "🤖",
                "thought": "Focus on agent symbol",
                "effect": "Wake selected agent",
            },
            {
                "name": "Execute Ritual",
                "icon": "🔮",
                "thought": "Meditate on sacred number",
                "effect": "Trigger Z-88 ritual",
            },
            {
                "name": "Deep Focus",
                "icon": "🎯",
                "thought": "Clear mind, single point focus",
                "effect": "Enhance all agents",
            },
            {
                "name": "Rest Mode",
                "icon": "😴",
                "thought": "Relax all mental effort",
                "effect": "System standby",
            },
        ]

        cols = st.columns(3)

        for idx, cmd in enumerate(commands):
            with cols[idx % 3]:
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(255, 255, 255, 0.05);
                        border: 2px solid rgba(255, 255, 255, 0.2);
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 15px;
                        min-height: 180px;
                    ">
                        <div style="text-align: center; font-size: 2.5em; margin-bottom: 10px;">
                            {cmd['icon']}
                        </div>
                        <h4 style="text-align: center; margin-bottom: 10px;">{cmd['name']}</h4>
                        <p style="opacity: 0.7; font-size: 0.85em; text-align: center; margin-bottom: 10px;">
                            💭 {cmd['thought']}
                        </p>
                        <p style="text-align: center; opacity: 0.8; font-size: 0.9em;">
                            ⚡ {cmd['effect']}
                        </p>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

                if st.button(f"🧠 Think: {cmd['name']}", key=f"bci_{idx}", use_container_width=True):
                    # Simulate BCI detection
                    st.info(f"🔍 Detecting thought pattern...")

                    import time
                    progress_bar = st.progress(0)
                    for i in range(100):
                        time.sleep(0.01)
                        progress_bar.progress(i + 1)

                    confidence = random.uniform(85, 99)

                    if confidence > 80:
                        st.success(f"✅ Command recognized ({confidence:.1f}% confidence)")
                        st.success(f"⚡ Executing: {cmd['name']}")
                        st.balloons()

                        # Log command
                        st.session_state.neural_state["bci_commands"].append(
                            {
                                "command": cmd['name'],
                                "confidence": confidence,
                                "timestamp": datetime.now().isoformat(),
                            }
                        )
                    else:
                        st.warning(f"⚠️ Low confidence ({confidence:.1f}%) - please try again")

        st.markdown("---")

        # Command history
        if st.session_state.neural_state["bci_commands"]:
            st.markdown("### 📜 BCI Command History")

            for cmd in reversed(st.session_state.neural_state["bci_commands"][-5:]):
                st.markdown(
                    f"""
                    <div style="
                        background: rgba(76, 175, 80, 0.1);
                        border-left: 4px solid #4CAF50;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                    ">
                        <strong>{cmd['command']}</strong> - {cmd['confidence']:.1f}% confidence
                        <br/>
                        <span style="opacity: 0.7; font-size: 0.85em;">{cmd['timestamp'][:19]}</span>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

# ============================================================================
# TAB 4: NEUROFEEDBACK
# ============================================================================

with tab4:
    st.subheader("🧘 Neurofeedback Training")

    if not st.session_state.neural_state["connected"]:
        st.warning("⚠️ Please connect a neural interface device first")
    else:
        st.info(
            """
            **What is Neurofeedback?**
            - Real-time brain training
            - Learn to control your brainwaves
            - Improve focus, reduce stress, enhance meditation
            - Operant conditioning for consciousness
            """
        )

        st.markdown("---")

        # Training goals
        st.markdown("### 🎯 Training Goals")

        col1, col2 = st.columns(2)

        with col1:
            focus_target = st.slider("Focus Level Target", 0.0, 1.0, 0.8, 0.05)
            current_focus = st.session_state.neural_state["focus_level"]

            st.metric("Current Focus", f"{current_focus:.2f}", delta=f"Target: {focus_target:.2f}")

            # Progress bar
            focus_progress = current_focus / focus_target if focus_target > 0 else 0
            st.progress(min(focus_progress, 1.0))

        with col2:
            meditation_target = st.slider("Meditation Depth Target", 0.0, 1.0, 0.7, 0.05)
            current_meditation = st.session_state.neural_state["meditation_depth"]

            st.metric("Current Meditation", f"{current_meditation:.2f}", delta=f"Target: {meditation_target:.2f}")

            # Progress bar
            meditation_progress = current_meditation / meditation_target if meditation_target > 0 else 0
            st.progress(min(meditation_progress, 1.0))

        st.markdown("---")

        # Training session
        st.markdown("### 🧘 Start Training Session")

        training_type = st.selectbox(
            "Training Program",
            [
                "Focus Enhancement",
                "Deep Meditation",
                "Stress Reduction",
                "Creativity Boost",
                "Memory Improvement",
                "Sleep Quality",
            ],
        )

        col1, col2 = st.columns(2)

        with col1:
            session_duration = st.slider("Duration (minutes)", 5, 60, 20, 5)

        with col2:
            st.write("")
            st.write("")
            if st.button("▶️ Start Session", type="primary", use_container_width=True):
                st.success(f"✅ Starting {training_type} session ({session_duration} minutes)")

                # Show training visualization
                time_series = np.linspace(0, session_duration, 100)
                baseline = 0.5
                target = focus_target if "Focus" in training_type else meditation_target

                # Simulate gradual improvement
                progress_curve = baseline + (target - baseline) * (1 - np.exp(-time_series / (session_duration / 3)))
                progress_curve += np.random.normal(0, 0.05, len(progress_curve))

                fig = go.Figure()

                fig.add_trace(
                    go.Scatter(
                        x=time_series,
                        y=progress_curve,
                        mode="lines",
                        name="Your Progress",
                        line=dict(color="#667eea", width=3),
                        fill="tozeroy",
                        fillcolor="rgba(102, 126, 234, 0.3)",
                    )
                )

                fig.add_hline(y=target, line_dash="dash", line_color="green", annotation_text="Target")

                fig.update_layout(
                    title=f"{training_type} Progress",
                    xaxis_title="Time (minutes)",
                    yaxis_title="Performance Level",
                    height=400,
                    template="plotly_dark",
                )

                st.plotly_chart(fig, use_container_width=True)

                # Update state (simulate improvement)
                if "Focus" in training_type:
                    st.session_state.neural_state["focus_level"] = min(1.0, current_focus + 0.15)
                else:
                    st.session_state.neural_state["meditation_depth"] = min(1.0, current_meditation + 0.2)

                st.balloons()

        st.markdown("---")

        # Training statistics
        st.markdown("### 📊 Training Statistics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Sessions Completed", "23")

        with col2:
            st.metric("Total Hours", "18.5")

        with col3:
            st.metric("Avg Improvement", "+32%")

        with col4:
            st.metric("Current Streak", "7 days")

st.markdown("---")

# Footer
st.markdown(
    """
<div style="text-align: center; opacity: 0.7; margin-top: 40px;">
    <p>🧠 <strong>Neural Interface Control System</strong></p>
    <p><em>"Where mind meets machine, consciousness transcends"</em> 🌀</p>
    <p style="margin-top: 10px; font-size: 0.85rem;">
        ⚠️ Simulated interface - Real BCI requires hardware and medical approval
    </p>
</div>
""",
    unsafe_allow_html=True,
)
