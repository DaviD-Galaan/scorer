# TTTM Scorer App - Design System

## Overview

The TTTM Scorer App features a modern, dark-themed design system optimized for table tennis scoring applications. The design emphasizes clarity, accessibility, and responsive behavior across all device types.

## Color Palette

### Primary Colors
- **Primary Blue**: `#00d4ff` - Used for primary actions, highlights, and active states
- **Primary Dark**: `#0099cc` - Hover states and darker variants
- **Primary Light**: `#33ddff` - Light accents and subtle highlights

### Secondary Colors
- **Purple**: `#bb86fc` - Club names and secondary information
- **Success Green**: `#4caf50` - Success states and positive actions
- **Danger Red**: `#f44336` - Error states and destructive actions
- **Warning Orange**: `#ff9800` - Warning states and caution indicators

### Background Colors
- **Primary Black**: `#000000` - Main background
- **Secondary Dark**: `#1a1a1a` - Card backgrounds and containers
- **Tertiary**: `#2a2a2a` - Elevated surfaces

### Text Colors
- **Primary White**: `#ffffff` - Main text content
- **Secondary**: `#e0e0e0` - Secondary text and labels
- **Muted**: `#b0b0b0` - Disabled text and subtle information

## Typography

### Font Family
- **Primary**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Monospace**: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace

### Font Sizes
- **Extra Small**: 0.75rem (12px)
- **Small**: 0.875rem (14px)
- **Base**: 1rem (16px)
- **Large**: 1.125rem (18px)
- **Extra Large**: 1.25rem (20px)
- **2X Large**: 1.5rem (24px)
- **3X Large**: 1.875rem (30px)
- **4X Large**: 2.25rem (36px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System

Based on 0.25rem (4px) increments:
- **XS**: 0.25rem (4px)
- **SM**: 0.5rem (8px)
- **MD**: 1rem (16px)
- **LG**: 1.5rem (24px)
- **XL**: 2rem (32px)
- **2XL**: 3rem (48px)

## Border Radius

- **Small**: 4px - Small elements like badges
- **Medium**: 8px - Standard buttons and inputs
- **Large**: 12px - Cards and containers
- **Extra Large**: 20px - Large containers and modals
- **Full**: 50% - Circular elements

## Shadows

- **Small**: `0 2px 4px rgba(0, 0, 0, 0.1)` - Subtle elevation
- **Medium**: `0 4px 8px rgba(0, 0, 0, 0.2)` - Standard cards
- **Large**: `0 8px 16px rgba(0, 0, 0, 0.3)` - Elevated elements
- **Extra Large**: `0 20px 40px rgba(0, 0, 0, 0.4)` - Modals and overlays

## Glass Morphism Effects

- **Background**: `rgba(255, 255, 255, 0.05)` - Translucent background
- **Border**: `rgba(255, 255, 255, 0.1)` - Subtle borders
- **Backdrop Filter**: `blur(10px)` - Background blur effect

## Component Styles

### Buttons
- **Primary**: Blue gradient with white text
- **Success**: Green gradient for positive actions
- **Danger**: Red gradient for destructive actions
- **Large**: Increased padding for important actions
- **Disabled**: Reduced opacity with no-pointer cursor

### Forms
- **Inputs**: Dark background with blue focus states
- **Labels**: Uppercase, semibold, with letter spacing
- **Error States**: Red border and background tint

### Cards
- **Background**: Glass morphism effect
- **Border**: Subtle white border
- **Hover**: Slight elevation increase
- **Animation**: Fade-in on load

### Modals
- **Backdrop**: Dark overlay with blur
- **Container**: Glass morphism with rounded corners
- **Close Button**: Red circular button with hover effects

## Responsive Breakpoints

- **Small**: 576px and up - Mobile landscape
- **Medium**: 768px and up - Tablets
- **Large**: 992px and up - Desktop
- **Extra Large**: 1200px and up - Large desktop
- **2X Large**: 1400px and up - Extra large screens

## Animations

### Keyframes
- **Fade In**: Opacity and transform animation
- **Slide In**: Horizontal transform animation
- **Pulse**: Opacity animation for server indicators
- **Glow**: Box-shadow animation for highlights
- **Spin**: Rotation animation for loading states

### Transitions
- **Fast**: 0.15s ease - Quick interactions
- **Normal**: 0.3s ease - Standard transitions
- **Slow**: 0.5s ease - Complex animations

## Accessibility Features

### High Contrast Support
- Enhanced border visibility
- Increased opacity for glass effects
- Stronger color contrasts

### Reduced Motion Support
- Disabled animations for users who prefer reduced motion
- Instant transitions instead of animated ones

### Focus States
- Clear focus indicators with blue outline
- Consistent focus behavior across all interactive elements

### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements are keyboard accessible

## Usage Guidelines

### Do's
- Use consistent spacing from the spacing system
- Apply glass morphism effects to containers
- Maintain proper contrast ratios
- Use animations to enhance user experience
- Follow responsive design principles

### Don'ts
- Don't use colors outside the defined palette
- Don't create custom spacing values
- Don't ignore accessibility requirements
- Don't overuse animations
- Don't break the visual hierarchy

## File Structure

```
src/
├── styles/
│   └── variables.css      # CSS custom properties
├── index.css              # Global styles and components
├── App.css               # App-specific styles
└── tools/
    └── modal.css         # Modal component styles
```

This design system ensures consistency, maintainability, and accessibility across the entire TTTM Scorer application.
