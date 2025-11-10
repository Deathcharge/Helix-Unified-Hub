import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
from scipy.io.wavfile import write
import io
import base64
import time
import json
from pathlib import Path

# Mobile-first configuration
st.set_page_config(
    page_title="Fractal Music Studio",
    page_icon="🌀",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items={
        'Get Help': None,
        'Report a bug': None,
        'About': "Fractal Music Studio - Generate music from mathematical fractals"
    }
)

# Mobile-optimized CSS
st.markdown("""
<style>
    /* Mobile-first responsive design */
    .main > div {
        padding: 0.5rem !important;
    }
    
    /* Hide Streamlit branding for cleaner mobile experience */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Full-width containers */
    .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 100%;
    }
    
    /* Mobile-friendly buttons */
    .stButton > button {
        width: 100%;
        height: 3rem;
        font-size: 1.1rem;
        margin: 0.25rem 0;
        border-radius: 10px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border: none;
    }
    
    /* Touch-friendly sliders */
    .stSlider > div > div > div {
        height: 2rem;
    }
    
    /* Responsive metrics */
    @media (max-width: 768px) {
        .metric-container {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    }
    
    /* Custom fractal display */
    .fractal-container {
        background: rgba(0,0,0,0.1);
        border-radius: 15px;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    /* Audio player styling */
    audio {
        width: 100%;
        margin: 1rem 0;
    }
    
    /* Tab styling for mobile */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.5rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 3rem;
        font-size: 1rem;
    }
</style>
""", unsafe_allow_html=True)

class MobileFractalStudio:
    def __init__(self):
        # Initialize session state
        if 'fractal_params' not in st.session_state:
            st.session_state.fractal_params = {
                'zoom': 1.0,
                'center_x': -0.745,
                'center_y': 0.113,
                'iterations': 100,
                'colormap': 'hot'
            }
        
        if 'preset_locations' not in st.session_state:
            st.session_state.preset_locations = {
                'Classic Mandelbrot': (-0.745, 0.113, 1.0),
                'Seahorse Valley': (-0.75, 0.1, 50.0),
                'Lightning': (-1.77, 0.0, 100.0),
                'Spiral': (-0.16, 1.04, 200.0),
                'Mini Mandelbrot': (-1.25, 0.0, 300.0)
            }
    
    def mandelbrot_optimized(self, width, height, zoom, center_x, center_y, max_iter):
        """Mobile-optimized Mandelbrot calculation"""
        x = np.linspace(center_x - 2/zoom, center_x + 2/zoom, width)
        y = np.linspace(center_y - 1.5/zoom, center_y + 1.5/zoom, height)
        X, Y = np.meshgrid(x, y)
        C = X + 1j*Y
        Z = np.zeros_like(C)
        escape_time = np.zeros(C.shape, dtype=int)
        
        # Vectorized calculation for better mobile performance
        for i in range(max_iter):
            mask = np.abs(Z) <= 2
            Z[mask] = Z[mask]**2 + C[mask]
            escape_time[mask] = i
            
        return escape_time

    def generate_audio_from_fractal(self, fractal_data, base_freq=136.1, duration=3):
        """Generate audio based on fractal characteristics"""
        sample_rate = 44100
        t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
        
        # Extract musical parameters from fractal
        complexity = np.std(fractal_data)
        avg_escape = np.mean(fractal_data[fractal_data > 0])
        
        # Base tone
        wave = np.sin(2 * np.pi * base_freq * t)
        
        # Add harmonics based on fractal complexity
        harmonics = [base_freq * 1.5, base_freq * 2, base_freq * 3]
        for i, harmonic in enumerate(harmonics):
            amplitude = complexity / (100 * (i + 1))
            wave += amplitude * np.sin(2 * np.pi * harmonic * t)
        
        # Modulate with fractal rhythm
        modulation_freq = avg_escape / 10
        modulation = 1 + 0.2 * np.sin(2 * np.pi * modulation_freq * t)
        wave *= modulation
        
        # Normalize
        wave = wave / np.max(np.abs(wave)) * 0.7
        
        return wave, sample_rate

    def create_mobile_fractal_plot(self, fractal_data, params):
        """Create mobile-optimized fractal plot"""
        # Adjust figure size for mobile
        fig, ax = plt.subplots(figsize=(10, 8))
        fig.patch.set_facecolor('black')
        
        extent = [
            params['center_x'] - 2/params['zoom'],
            params['center_x'] + 2/params['zoom'],
            params['center_y'] - 1.5/params['zoom'],
            params['center_y'] + 1.5/params['zoom']
        ]
        
        im = ax.imshow(fractal_data, extent=extent, cmap=params['colormap'], origin='lower')
        
        # Mobile-friendly title and labels
        ax.set_title(f'Zoom: {params["zoom"]:.1f}x | Center: ({params["center_x"]:.3f}, {params["center_y"]:.3f})', 
                    fontsize=12, color='white', pad=20)
        ax.set_xlabel('Real Axis', fontsize=10, color='white')
        ax.set_ylabel('Imaginary Axis', fontsize=10, color='white')
        
        # Style for mobile
        ax.tick_params(colors='white', labelsize=8)
        
        # Colorbar
        cbar = plt.colorbar(im, ax=ax, shrink=0.8)
        cbar.set_label('Escape Time', color='white', fontsize=10)
        cbar.ax.tick_params(colors='white', labelsize=8)
        
        plt.tight_layout()
        return fig

    def audio_to_base64(self, audio_data, sample_rate):
        """Convert audio to base64 for HTML player"""
        audio_int = (audio_data * 32767).astype(np.int16)
        buffer = io.BytesIO()
        write(buffer, sample_rate, audio_int)
        return base64.b64encode(buffer.getvalue()).decode()

    def create_algorithmic_prompt(self, params, fractal_data):
        """Generate Mureka.ai prompt from current fractal"""
        complexity = np.std(fractal_data)
        avg_escape = np.mean(fractal_data[fractal_data > 0])
        
        prompt = f"""import numpy as np

# Mobile fractal consciousness streams into algorithmic music
# Touch interactions become harmonic coordinates

def mobile_fractal_symphony(zoom={params['zoom']:.3f}, center_x={params['center_x']:.3f}, center_y={params['center_y']:.3f}):
    # Touch coordinates map to complex plane
    c = complex(center_x, center_y)
    z = 0
    
    # Fractal iteration creates mobile rhythms
    musical_textures = []
    for i in range({params['iterations']}):
        if abs(z) > 2:
            break
        z = z*z + c
        musical_textures.append(abs(z))
    
    # Mobile zoom gestures control harmonic depth
    touch_frequency = 136.1 * zoom
    
    # Fractal complexity becomes musical complexity
    harmonic_layers = {complexity:.3f}
    escape_rhythm = {avg_escape:.3f}
    
    # Mobile mathematics becomes portable music
    return touch_frequency, harmonic_layers, escape_rhythm

# Execute mobile fractal algorithm
freq, layers, rhythm = mobile_fractal_symphony()

# Every swipe, pinch, and tap births new mathematical melodies
# Pocket-sized infinite complexity becomes handheld symphonies"""
        
        return prompt

    def run_mobile_app(self):
        # Header with mobile-friendly design
        st.markdown("""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 1.5rem; border-radius: 15px; text-align: center; margin-bottom: 1rem;">
            <h1 style="color: white; margin: 0; font-size: 2rem;">🌀 Fractal Music Studio</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 0.5rem 0 0 0;">Mobile Mathematical Music Generator</p>
        </div>
        """, unsafe_allow_html=True)

        # Create tabs for mobile navigation
        tab1, tab2, tab3, tab4 = st.tabs(["🎨 Fractal", "🎵 Audio", "🚀 Presets", "📱 Export"])
        
        with tab1:
            st.subheader("Fractal Generator")
            
            # Mobile-friendly controls in columns
            col1, col2 = st.columns(2)
            
            with col1:
                zoom = st.slider("Zoom", 0.1, 100.0, st.session_state.fractal_params['zoom'], 0.1,
                               help="Pinch to zoom in fractal exploration")
                center_x = st.slider("Center X", -2.0, 1.0, st.session_state.fractal_params['center_x'], 0.001)
                
            with col2:
                center_y = st.slider("Center Y", -1.5, 1.5, st.session_state.fractal_params['center_y'], 0.001)
                iterations = st.slider("Quality", 50, 300, st.session_state.fractal_params['iterations'], 10)
            
            # Colormap selection
            colormap = st.selectbox("Color Scheme", 
                                  ["hot", "plasma", "inferno", "viridis", "magma", "twilight"],
                                  index=["hot", "plasma", "inferno", "viridis", "magma", "twilight"].index(
                                      st.session_state.fractal_params['colormap']))
            
            # Update params
            st.session_state.fractal_params.update({
                'zoom': zoom, 'center_x': center_x, 'center_y': center_y,
                'iterations': iterations, 'colormap': colormap
            })
            
            # Generate button
            if st.button("Generate Fractal", type="primary"):
                with st.spinner("Generating fractal..."):
                    # Mobile-optimized resolution
                    width, height = 800, 600
                    
                    fractal_data = self.mandelbrot_optimized(
                        width, height, zoom, center_x, center_y, iterations
                    )
                    
                    fig = self.create_mobile_fractal_plot(fractal_data, st.session_state.fractal_params)
                    st.pyplot(fig, use_container_width=True)
                    plt.close(fig)
                    
                    # Store fractal data for audio generation
                    st.session_state['current_fractal'] = fractal_data
                    
                    # Mobile metrics
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Complexity", f"{np.std(fractal_data):.1f}")
                    col2.metric("Coverage", f"{np.sum(fractal_data > 0) / fractal_data.size * 100:.1f}%")
                    col3.metric("Depth", f"{np.max(fractal_data)}")

        with tab2:
            st.subheader("Audio Generation")
            
            if 'current_fractal' in st.session_state:
                col1, col2 = st.columns(2)
                
                with col1:
                    base_freq = st.slider("Base Frequency", 50.0, 500.0, 136.1, 0.1)
                    duration = st.slider("Duration", 1.0, 10.0, 3.0, 0.1)
                    
                with col2:
                    st.info("Audio will be generated based on the current fractal's mathematical properties")
                
                if st.button("Generate Fractal Music", type="primary"):
                    with st.spinner("Creating algorithmic music..."):
                        audio_data, sample_rate = self.generate_audio_from_fractal(
                            st.session_state['current_fractal'], base_freq, duration
                        )
                        
                        # Create audio player
                        audio_b64 = self.audio_to_base64(audio_data, sample_rate)
                        
                        st.markdown("""
                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                            <h4 style="color: white; margin-bottom: 1rem;">🎵 Your Fractal Music</h4>
                        """, unsafe_allow_html=True)
                        
                        st.audio(f"data:audio/wav;base64,{audio_b64}")
                        st.markdown("</div>", unsafe_allow_html=True)
                        
                        # Show algorithm for Mureka.ai
                        st.subheader("🤖 Mureka.ai Algorithm")
                        prompt = self.create_algorithmic_prompt(
                            st.session_state.fractal_params, 
                            st.session_state['current_fractal']
                        )
                        st.code(prompt, language='python')
                        
            else:
                st.info("Generate a fractal first to create music from it!")

        with tab3:
            st.subheader("Fractal Presets")
            
            for name, (x, y, z) in st.session_state.preset_locations.items():
                if st.button(f"📍 {name}", key=f"preset_{name}"):
                    st.session_state.fractal_params.update({
                        'center_x': x, 'center_y': y, 'zoom': z
                    })
                    st.success(f"Loaded {name} preset!")
                    st.rerun()
            
            st.subheader("Custom Coordinates")
            coord_input = st.text_input("Enter coordinates (x,y,zoom)", 
                                      placeholder="-0.745,0.113,1.0")
            
            if st.button("Load Coordinates") and coord_input:
                try:
                    x, y, z = map(float, coord_input.split(','))
                    st.session_state.fractal_params.update({
                        'center_x': x, 'center_y': y, 'zoom': z
                    })
                    st.success("Custom coordinates loaded!")
                    st.rerun()
                except:
                    st.error("Invalid format. Use: x,y,zoom")

        with tab4:
            st.subheader("Export & Share")
            
            # PWA installation prompt
            st.markdown("""
            <div style="background: linear-gradient(45deg, #4CAF50, #45a049); 
                        padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <h4 style="color: white; margin: 0;">📱 Install as App</h4>
                <p style="color: white; margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                    Add to your home screen for the full mobile app experience!
                </p>
            </div>
            """, unsafe_allow_html=True)
            
            # Export current session
            if st.button("📤 Export Session"):
                session_data = {
                    'fractal_params': st.session_state.fractal_params,
                    'timestamp': time.time()
                }
                
                json_str = json.dumps(session_data, indent=2)
                st.download_button(
                    "💾 Download Session File",
                    json_str,
                    f"fractal_session_{int(time.time())}.json",
                    "application/json"
                )
            
            # Import session
            uploaded_file = st.file_uploader("📁 Import Session", type=['json'])
            if uploaded_file:
                try:
                    session_data = json.load(uploaded_file)
                    st.session_state.fractal_params = session_data['fractal_params']
                    st.success("Session imported successfully!")
                    st.rerun()
                except:
                    st.error("Invalid session file")

# PWA service worker (for offline functionality)
SERVICE_WORKER = """
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('fractal-music-v1').then(cache => {
            return cache.addAll([
                '/',
                '/static/css/main.css',
                '/static/js/main.js'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
"""

def main():
    app = MobileFractalStudio()
    app.run_mobile_app()
    
    # Footer with mobile app info
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 1rem; color: rgba(255,255,255,0.7);">
        <p>🌀 Fractal Music Studio - v1.0 Mobile</p>
        <p>Mathematical music generation powered by fractal algorithms</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()

# Deployment instructions:
"""
1. Save as fractal_music_mobile.py
2. Install: pip install streamlit matplotlib numpy scipy
3. Run: streamlit run fractal_music_mobile.py
4. For mobile testing: streamlit run fractal_music_mobile.py --server.address 0.0.0.0
5. Access from phone browser using your computer's IP address
"""