/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx,js,jsx}",
		"./components/**/*.{ts,tsx,js,jsx}",
		"./app/**/*.{ts,tsx,js,jsx}",
		"./src/**/*.{ts,tsx,js,jsx}",
	  ],
	prefix: "",
	theme: {
	  container: {
		center: true,
		padding: '2rem',
		screens: {
		  '2xl': '1400px'
		}
	  },
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  customindigo: '#C4DBFF',
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  teal: {
			400: "#6DDCCF",
			500: "#5DCFC2",
			600: "#4EC2B5",
		  },
		  sidebar: {
			DEFAULT: 'hsl(var(--sidebar-background))',
			foreground: 'hsl(var(--sidebar-foreground))',
			primary: 'hsl(var(--sidebar-primary))',
			'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
			accent: 'hsl(var(--sidebar-accent))',
			'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
			border: 'hsl(var(--sidebar-border))',
			ring: 'hsl(var(--sidebar-ring))'
		  },
		  profileBlue: {
			50: '#EBF8FF',
			100: '#D1EBFF',
			200: '#A3D8FF',
			300: '#66B8FF',
			400: '#3097FD',
			500: '#0077ED',
			600: '#0062D6',
			700: '#004FB0',
			800: '#00398A',
			900: '#002A66'
		  },
		  profileTeal: {
			50: '#EFFCFC',
			100: '#D0F7F7',
			200: '#A0EEEE',
			300: '#6DE0E0',
			400: '#39CDCE',
			500: '#2BB8B9',
			600: '#1F9596',
			700: '#167273',
			800: '#0F5152',
			900: '#083333'
		  }
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		keyframes: {
		  'accordion-down': {
			from: { height: '0' },
			to: { height: 'var(--radix-accordion-content-height)' }
		  },
		  'accordion-up': {
			from: { height: 'var(--radix-accordion-content-height)' },
			to: { height: '0' }
		  },
		  fadeIn: {
			'0%': { opacity: '0' },
			'100%': { opacity: '1' }
		  },
		  slideUpFade: {
			'0%': { transform: 'translateY(20px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' }
		  },
		  shimmer: {
			'0%': { backgroundPosition: '-500px 0' },
			'100%': { backgroundPosition: '500px 0' }
		  },
		  pulse: {
			'0%, 100%': { opacity: '0.5' },
			'50%': { opacity: '0.8' }
		  }
		},
		animation: {
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out',
		  'fade-in': 'fadeIn 0.5s ease-out forwards',
		  'slide-up-fade': 'slideUpFade 0.6s ease-out forwards',
		  'shimmer': 'shimmer 2s infinite linear',
		  'pulse-slow': 'pulse 3s infinite ease-in-out'
		},
		backgroundImage: {
		  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  'profile-gradient': 'linear-gradient(to right, var(--profile-gradient-from), var(--profile-gradient-to))',
		},
		backdropBlur: {
		  xs: '2px',
		},
		transitionProperty: {
		  'height': 'height',
		  'spacing': 'margin, padding',
		}
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };