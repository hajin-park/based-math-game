/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
    	container: {
    		center: true,
    		padding: {
    			DEFAULT: '1rem',
    			sm: '2rem',
    			lg: '4rem',
    			xl: '5rem',
    			'2xl': '6rem',
    		},
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			success: {
    				DEFAULT: 'hsl(var(--success))',
    				foreground: 'hsl(var(--success-foreground))'
    			},
    			warning: {
    				DEFAULT: 'hsl(var(--warning))',
    				foreground: 'hsl(var(--warning-foreground))'
    			},
    			info: {
    				DEFAULT: 'hsl(var(--info))',
    				foreground: 'hsl(var(--info-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
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
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			xl: 'calc(var(--radius) + 4px)',
    			'2xl': 'calc(var(--radius) + 8px)',
    		},
    		fontSize: {
    			'xs': ['0.75rem', { lineHeight: '1rem' }],
    			'sm': ['0.875rem', { lineHeight: '1.25rem' }],
    			'base': ['1rem', { lineHeight: '1.5rem' }],
    			'lg': ['1.125rem', { lineHeight: '1.75rem' }],
    			'xl': ['1.25rem', { lineHeight: '1.75rem' }],
    			'2xl': ['1.5rem', { lineHeight: '2rem' }],
    			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    			'5xl': ['3rem', { lineHeight: '1' }],
    			'6xl': ['3.75rem', { lineHeight: '1' }],
    			'7xl': ['4.5rem', { lineHeight: '1' }],
    			'8xl': ['6rem', { lineHeight: '1' }],
    			'9xl': ['8rem', { lineHeight: '1' }],
    		},
    		spacing: {
    			'18': '4.5rem',
    			'88': '22rem',
    			'128': '32rem',
    		},
    		boxShadow: {
    			'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    			'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    			'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    			'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    			'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    			'glow': '0 0 20px rgb(6 182 212 / 0.3)',
    			'glow-lg': '0 0 40px rgb(6 182 212 / 0.4)',
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'fade-in': {
    				from: {
    					opacity: '0'
    				},
    				to: {
    					opacity: '1'
    				}
    			},
    			'fade-out': {
    				from: {
    					opacity: '1'
    				},
    				to: {
    					opacity: '0'
    				}
    			},
    			'slide-in-from-top': {
    				from: {
    					transform: 'translateY(-100%)'
    				},
    				to: {
    					transform: 'translateY(0)'
    				}
    			},
    			'slide-in-from-bottom': {
    				from: {
    					transform: 'translateY(100%)'
    				},
    				to: {
    					transform: 'translateY(0)'
    				}
    			},
    			'slide-in-from-left': {
    				from: {
    					transform: 'translateX(-100%)'
    				},
    				to: {
    					transform: 'translateX(0)'
    				}
    			},
    			'slide-in-from-right': {
    				from: {
    					transform: 'translateX(100%)'
    				},
    				to: {
    					transform: 'translateX(0)'
    				}
    			},
    			'pulse-glow': {
    				'0%, 100%': {
    					boxShadow: '0 0 20px rgb(6 182 212 / 0.3)'
    				},
    				'50%': {
    					boxShadow: '0 0 40px rgb(6 182 212 / 0.6)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			'fade-out': 'fade-out 0.3s ease-out',
    			'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
    			'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
    			'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
    			'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
    			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
};
