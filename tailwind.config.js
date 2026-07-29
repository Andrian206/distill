/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stage status colors
        'stage-not-started': '#9ca3af',
        'stage-partial': '#fbbf24',
        'stage-complete': '#10b981',
        'stage-needs-review': '#ef4444',
        
        // Confidence colors
        'confidence-high': '#10b981',
        'confidence-medium': '#fbbf24',
        'confidence-low': '#ef4444',
        'confidence-none': '#9ca3af',
        
        // Stage-specific colors
        'stage-idea': '#ffd700',
        'stage-user': '#87ceeb',
        'stage-workflow': '#98fb98',
        'stage-pain': '#ff6b6b',
        'stage-root': '#dda15e',
        'stage-assumption': '#bc6c25',
        'stage-evidence': '#8ecae6',
        'stage-opportunity': '#ffb703',
        'stage-decision': '#06d6a0',
        'stage-mvp': '#7209b7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

// Made with Bob
