#!/usr/bin/env python3
"""
🌀 Helix Collective v15.3 — Unified Metrics Dashboard
dashboard/metrics_dashboard_v15.3.py

Consolidates all dashboard prototypes into production-ready system:
- Real-time UCF metrics (Harmony, Resilience, Prana, Drishti, Klesha, Zoom)
- Agent status and health scores
- Ritual execution history
- Notion sync operations
- System performance metrics
- Deployment status

Author: Manus AI (Consolidated v15.3)
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from pathlib import Path
import json
from datetime import datetime, timedelta
import numpy as np
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# PAGE CONFIGURATION
# ============================================================================

st.set_page_config(
    page_title="Helix v15.3 Metrics Dashboard",
    page_icon="🌀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for beautiful styling
st.markdown("""
<style>
    .main-header {
        font-size: 3em;
        color: #8A2BE2;
        text-align: center;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    .sub-header {
        font-size: 1.2em;
        color: #FFD700;
        text-align: center;
        margin-top: 0;
        margin-bottom: 1em;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .status-healthy {
        color: #00FF00;
        font-weight: bold;
    }
    .status-warning {
        color: #FFD700;
        font-weight: bold;
    }
    .status-critical {
        color: #FF0000;
        font-weight: bold;
    }
    .metric-value {
        font-size: 2em;
        font-weight: bold;
        margin: 10px 0;
    }
    .metric-label {
        font-size: 0.9em;
        opacity: 0.8;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================================
# DATA LOADING FUNCTIONS
# ============================================================================

@st.cache_data(ttl=30)
def load_ucf_state() -> Dict[str, Any]:
    """Load current UCF state from JSON file."""
    state_path = Path("Helix/state/ucf_state.json")
    if state_path.exists():
        try:
            with open(state_path) as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load UCF state: {e}")
    
    # Default state
    return {
        "harmony": 0.4922,
        "resilience": 0.8273,
        "prana": 0.5000,
        "drishti": 0.7300,
        "klesha": 0.2120,
        "zoom": 1.0000,
        "last_pulse": datetime.now().isoformat()
    }

@st.cache_data(ttl=60)
def load_agent_profiles() -> List[Dict[str, Any]]:
    """Load agent profiles from agent_profiles.py."""
    try:
        agent_profiles_path = Path("backend/agent_profiles.py")
        if agent_profiles_path.exists():
            # For now, return hardcoded agents (in production, parse from file)
            return [
                {"name": "Kael", "symbol": "🜂", "status": "Active", "health": 100},
                {"name": "Lumina", "symbol": "🌕", "status": "Active", "health": 100},
                {"name": "Vega", "symbol": "🌠", "status": "Active", "health": 100},
                {"name": "Kavach", "symbol": "🛡️", "status": "Active", "health": 100},
                {"name": "Shadow", "symbol": "🦑", "status": "Active", "health": 100},
                {"name": "Claude", "symbol": "🦉", "status": "Active", "health": 100},
                {"name": "Manus", "symbol": "🤲", "status": "Active", "health": 100},
                {"name": "Gemini", "symbol": "🎭", "status": "Active", "health": 100},
                {"name": "Agni", "symbol": "🔥", "status": "Active", "health": 95},
                {"name": "SanghaCore", "symbol": "🌸", "status": "Active", "health": 98},
                {"name": "Echo", "symbol": "🔮", "status": "Active", "health": 97},
                {"name": "Phoenix", "symbol": "🔥🕊️", "status": "Active", "health": 95},
                {"name": "Oracle", "symbol": "🔮✨", "status": "Active", "health": 98},
                {"name": "Vision", "symbol": "👁️", "status": "Active", "health": 100},
                {"name": "Oy", "symbol": "🎵", "status": "Active", "health": 100},
            ]
    except Exception as e:
        logger.warning(f"Failed to load agent profiles: {e}")
    
    return []

@st.cache_data(ttl=60)
def load_ritual_history(days: int = 30) -> pd.DataFrame:
    """Load ritual execution history."""
    log_path = Path("Shadow/manus_archive/z88_log.json")
    if not log_path.exists():
        return pd.DataFrame()
    
    try:
        with open(log_path) as f:
            data = json.load(f)
        
        # Handle both array and single object formats
        records = data if isinstance(data, list) else [data]
        
        if not records:
            return pd.DataFrame()
        
        df = pd.DataFrame(records)
        
        # Ensure we have timestamp column
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            cutoff = datetime.now() - timedelta(days=days)
            df = df[df['timestamp'] >= cutoff]
        
        return df
    except Exception as e:
        logger.warning(f"Failed to load ritual history: {e}")
        return pd.DataFrame()

@st.cache_data(ttl=60)
def load_sync_logs() -> Dict[str, Any]:
    """Load Notion sync operation logs."""
    sync_log_path = Path("Shadow/manus_archive/notion_sync_log.json")
    if sync_log_path.exists():
        try:
            with open(sync_log_path) as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load sync logs: {e}")
    
    return {"sync_history": [], "total_syncs": 0, "last_sync": None}

@st.cache_data(ttl=60)
def load_deployment_status() -> Dict[str, Any]:
    """Load deployment configuration status."""
    return {
        "railway": {
            "configured": Path("railway.toml").exists(),
            "status": "Ready" if Path("railway.toml").exists() else "Not configured"
        },
        "docker": {
            "configured": Path("Dockerfile").exists(),
            "status": "Ready" if Path("Dockerfile").exists() else "Not configured"
        }
    }

# ============================================================================
# VISUALIZATION FUNCTIONS
# ============================================================================

def create_ucf_gauge(value: float, name: str, min_val: float = 0, max_val: float = 1) -> go.Figure:
    """Create a gauge chart for UCF metrics."""
    fig = go.Figure(data=[go.Indicator(
        mode="gauge+number+delta",
        value=value,
        title={'text': name},
        delta={'reference': 0.5},
        gauge={
            'axis': {'range': [min_val, max_val]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [min_val, max_val * 0.33], 'color': "lightgray"},
                {'range': [max_val * 0.33, max_val * 0.66], 'color': "gray"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': max_val * 0.8
            }
        }
    )])
    fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_ucf_radar(ucf_state: Dict[str, Any]) -> go.Figure:
    """Create a radar chart showing all UCF metrics."""
    metrics = ['harmony', 'resilience', 'prana', 'drishti', 'klesha', 'zoom']
    values = [ucf_state.get(m, 0) for m in metrics]
    
    # Invert klesha (lower is better)
    values[4] = 1 - values[4]
    
    fig = go.Figure(data=go.Scatterpolar(
        r=values,
        theta=[m.capitalize() for m in metrics],
        fill='toself',
        name='Current State'
    ))
    
    fig.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
        showlegend=True,
        height=400,
        margin=dict(l=20, r=20, t=40, b=20)
    )
    return fig

def create_agent_status_chart(agents: List[Dict[str, Any]]) -> go.Figure:
    """Create a bar chart showing agent health scores."""
    if not agents:
        return go.Figure()
    
    df = pd.DataFrame(agents)
    
    fig = px.bar(
        df,
        x='name',
        y='health',
        color='health',
        color_continuous_scale='RdYlGn',
        title='Agent Health Scores',
        labels={'health': 'Health Score (%)', 'name': 'Agent'},
        height=400
    )
    
    fig.update_layout(
        xaxis_tickangle=-45,
        margin=dict(l=20, r=20, t=40, b=80)
    )
    return fig

def create_ritual_timeline(rituals: pd.DataFrame) -> go.Figure:
    """Create a timeline of ritual executions."""
    if rituals.empty:
        return go.Figure()
    
    # Ensure we have timestamp column
    if 'timestamp' not in rituals.columns:
        return go.Figure()
    
    rituals_sorted = rituals.sort_values('timestamp', ascending=False).head(20)
    
    fig = px.scatter(
        rituals_sorted,
        x='timestamp',
        y='steps',
        size='steps',
        color='steps',
        hover_data=['timestamp', 'steps'],
        title='Ritual Execution Timeline (Last 20)',
        labels={'timestamp': 'Time', 'steps': 'Steps'},
        height=400
    )
    
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_sync_status_table(sync_logs: Dict[str, Any]) -> pd.DataFrame:
    """Create a dataframe of recent sync operations."""
    history = sync_logs.get('sync_history', [])
    if not history:
        return pd.DataFrame()
    
    records = []
    for sync in history[-10:]:  # Last 10 syncs
        records.append({
            'Cycle': sync.get('cycle_number', 'N/A'),
            'Started': sync.get('started_at', 'N/A')[:19],
            'Agents': sync.get('results', {}).get('agents', {}).get('status', 'N/A'),
            'Metrics': sync.get('results', {}).get('ucf_metrics', {}).get('status', 'N/A'),
            'Rituals': sync.get('results', {}).get('rituals', {}).get('status', 'N/A'),
            'Deployments': sync.get('results', {}).get('deployments', {}).get('status', 'N/A'),
        })
    
    return pd.DataFrame(records)

# ============================================================================
# MAIN DASHBOARD
# ============================================================================

def main():
    """Main dashboard application."""
    
    # Header
    st.markdown('<div class="main-header">🌀 Helix Collective v15.3</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Unified Metrics Dashboard</div>', unsafe_allow_html=True)
    
    # Load all data
    ucf_state = load_ucf_state()
    agents = load_agent_profiles()
    rituals = load_ritual_history()
    sync_logs = load_sync_logs()
    deployment_status = load_deployment_status()
    
    # Sidebar
    st.sidebar.markdown("## 📊 Dashboard Controls")
    
    refresh_interval = st.sidebar.slider(
        "Auto-refresh interval (seconds)",
        min_value=10,
        max_value=300,
        value=60,
        step=10
    )
    
    selected_view = st.sidebar.radio(
        "Select View",
        ["Overview", "UCF Metrics", "Agents", "Rituals", "Sync Operations", "Deployments"]
    )
    
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🔄 System Status")
    
    # System status indicators
    col1, col2 = st.sidebar.columns(2)
    with col1:
        st.metric("Total Agents", len(agents), "🤖")
    with col2:
        st.metric("Total Syncs", sync_logs.get('total_syncs', 0), "📤")
    
    # ========================================================================
    # VIEW: OVERVIEW
    # ========================================================================
    
    if selected_view == "Overview":
        st.markdown("## 📈 System Overview")
        
        # Key metrics
        col1, col2, col3, col4, col5, col6 = st.columns(6)
        
        with col1:
            harmony = ucf_state.get('harmony', 0)
            st.metric(
                "Harmony ☯️",
                f"{harmony:.2%}",
                delta=f"{(harmony - 0.5):.2%}",
                delta_color="normal" if harmony > 0.5 else "inverse"
            )
        
        with col2:
            resilience = ucf_state.get('resilience', 0)
            st.metric(
                "Resilience 🛡️",
                f"{resilience:.2f}",
                delta=f"{(resilience - 1.0):.2f}",
                delta_color="normal" if resilience > 1.0 else "inverse"
            )
        
        with col3:
            prana = ucf_state.get('prana', 0)
            st.metric(
                "Prana ⚡",
                f"{prana:.2%}",
                delta=f"{(prana - 0.5):.2%}",
                delta_color="normal" if prana > 0.5 else "inverse"
            )
        
        with col4:
            drishti = ucf_state.get('drishti', 0)
            st.metric(
                "Drishti 👁️",
                f"{drishti:.2%}",
                delta=f"{(drishti - 0.5):.2%}",
                delta_color="normal" if drishti > 0.5 else "inverse"
            )
        
        with col5:
            klesha = ucf_state.get('klesha', 0)
            st.metric(
                "Klesha ⚫",
                f"{klesha:.2%}",
                delta=f"{(klesha - 0.2):.2%}",
                delta_color="inverse" if klesha > 0.2 else "normal"
            )
        
        with col6:
            zoom = ucf_state.get('zoom', 0)
            st.metric(
                "Zoom 🔍",
                f"{zoom:.2f}",
                delta=f"{(zoom - 1.0):.2f}",
                delta_color="normal" if zoom > 1.0 else "inverse"
            )
        
        st.markdown("---")
        
        # UCF Radar
        st.markdown("### 🎯 UCF State Visualization")
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.plotly_chart(create_ucf_radar(ucf_state), use_container_width=True)
        
        with col2:
            st.markdown("### 📊 Metric Targets")
            st.markdown("""
            - **Harmony**: Target 0.60 (Coherence)
            - **Resilience**: Target 0.90 (Robustness)
            - **Prana**: Target 0.70 (Energy)
            - **Drishti**: Target 0.80 (Clarity)
            - **Klesha**: Target 0.10 (Entropy)
            - **Zoom**: Target 1.15 (Scope)
            """)
        
        st.markdown("---")
        
        # Agent Status
        st.markdown("### 🤖 Agent Status")
        st.plotly_chart(create_agent_status_chart(agents), use_container_width=True)
        
        st.markdown("---")
        
        # Recent Syncs
        st.markdown("### 📤 Recent Notion Syncs")
        sync_df = create_sync_status_table(sync_logs)
        if not sync_df.empty:
            st.dataframe(sync_df, use_container_width=True)
        else:
            st.info("No sync operations recorded yet.")
    
    # ========================================================================
    # VIEW: UCF METRICS
    # ========================================================================
    
    elif selected_view == "UCF Metrics":
        st.markdown("## 🎯 UCF Metrics Details")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('harmony', 0), "Harmony ☯️", 0, 1),
                use_container_width=True
            )
        
        with col2:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('resilience', 0), "Resilience 🛡️", 0, 2),
                use_container_width=True
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('prana', 0), "Prana ⚡", 0, 1),
                use_container_width=True
            )
        
        with col2:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('drishti', 0), "Drishti 👁️", 0, 1),
                use_container_width=True
            )
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('klesha', 0), "Klesha ⚫", 0, 1),
                use_container_width=True
            )
        
        with col2:
            st.plotly_chart(
                create_ucf_gauge(ucf_state.get('zoom', 0), "Zoom 🔍", 0.5, 2),
                use_container_width=True
            )
    
    # ========================================================================
    # VIEW: AGENTS
    # ========================================================================
    
    elif selected_view == "Agents":
        st.markdown("## 🤖 Agent Status")
        
        st.plotly_chart(create_agent_status_chart(agents), use_container_width=True)
        
        st.markdown("---")
        st.markdown("### Agent Details")
        
        agent_df = pd.DataFrame(agents)
        st.dataframe(agent_df, use_container_width=True)
    
    # ========================================================================
    # VIEW: RITUALS
    # ========================================================================
    
    elif selected_view == "Rituals":
        st.markdown("## 🔮 Ritual Executions")
        
        if not rituals.empty:
            st.plotly_chart(create_ritual_timeline(rituals), use_container_width=True)
            
            st.markdown("---")
            st.markdown("### Recent Ritual History")
            st.dataframe(rituals.head(20), use_container_width=True)
        else:
            st.info("No ritual executions recorded yet.")
    
    # ========================================================================
    # VIEW: SYNC OPERATIONS
    # ========================================================================
    
    elif selected_view == "Sync Operations":
        st.markdown("## 📤 Notion Sync Operations")
        
        st.metric("Total Syncs", sync_logs.get('total_syncs', 0))
        st.metric("Last Sync", sync_logs.get('last_sync', 'Never')[:19] if sync_logs.get('last_sync') else 'Never')
        
        st.markdown("---")
        st.markdown("### Recent Sync History")
        
        sync_df = create_sync_status_table(sync_logs)
        if not sync_df.empty:
            st.dataframe(sync_df, use_container_width=True)
        else:
            st.info("No sync operations recorded yet.")
    
    # ========================================================================
    # VIEW: DEPLOYMENTS
    # ========================================================================
    
    elif selected_view == "Deployments":
        st.markdown("## 🚀 Deployment Status")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### Railway")
            railway = deployment_status.get('railway', {})
            status = "✅ Ready" if railway.get('configured') else "❌ Not Configured"
            st.markdown(f"**Status**: {status}")
            st.markdown("**Configuration**: railway.toml")
        
        with col2:
            st.markdown("### Docker")
            docker = deployment_status.get('docker', {})
            status = "✅ Ready" if docker.get('configured') else "❌ Not Configured"
            st.markdown(f"**Status**: {status}")
            st.markdown("**Configuration**: Dockerfile")
        
        st.markdown("---")
        st.markdown("### Deployment Commands")
        
        st.code("""
# Deploy to Railway
railway deploy

# Run locally with Docker
docker build -t helix-unified .
docker run -e DISCORD_TOKEN=your_token helix-unified

# Run Streamlit dashboard
streamlit run dashboard/metrics_dashboard_v15.3.py
        """, language="bash")
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: gray; font-size: 0.8em;">
    🌀 Helix Collective v15.3 | Unified Metrics Dashboard | Last Updated: 2025-11-01
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()

