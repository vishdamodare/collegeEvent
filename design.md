# design.md
# College Events Homepage Design Specification

Version: 1.0

---

# Purpose

This document is the complete visual specification for the homepage of the College Events website.

The homepage should recreate the same premium visual experience, layout philosophy, motion language, pacing, and interaction style as the provided reference animation, but all travel-related content must be replaced with college event content.

This document intentionally contains enough detail so that the homepage can be recreated without access to the original reference video.

---

# Design Philosophy

The homepage should immediately communicate that this is a premium platform for discovering college events.

The experience should feel:

- modern
- immersive
- cinematic
- premium
- smooth
- elegant
- minimal
- high-end
- interactive
- polished

The homepage should not feel like a dashboard.

Instead, it should feel like an experience.

The entire first screen should tell a story through motion.

---

# Overall Layout

The first screen occupies the entire viewport.

Height:
100vh

Width:
100%

There should never be any white background visible.

The entire screen is covered by one large immersive background image.

Everything is placed on top of this image.

Layers from bottom to top:

Layer 1
Full-screen event image

↓

Layer 2
Dark gradient overlay

↓

Layer 3
Glass effects

↓

Layer 4
Navigation

↓

Layer 5
Hero Content

↓

Layer 6
Floating Event Cards

↓

Layer 7
Navigation Controls

---

# Background

The background is the most important element.

Instead of travel destinations, use college event photography.

Examples:

Tech Fest

Hackathon

Robotics Competition

Cultural Night

Sports Tournament

Music Festival

Startup Expo

AI Conference

Workshop

Innovation Summit

Each event has its own full-screen background.

Images should:

cover entire viewport

object-fit: cover

high resolution

cinematic

sharp

rich colors

slightly darkened

No empty space should ever be visible.

---

# Background Overlay

Above every image add:

Dark black gradient

Opacity:
approximately 35–50%

Purpose:

Improve text readability

Increase cinematic feel

Focus attention on content

Gradient starts darker at bottom and lighter toward top.

---

# Navigation

Navigation stays fixed at the top.

Horizontal padding:

Large

Maximum width centered.

Layout:

LOGO

Home

Events

Colleges

About

Contact

Login

Sign Up

Sign Up opens:

Student

Admin

Navigation background:

Transparent

No solid navbar.

Only after scrolling should it become glassmorphism.

---

# Hero Layout

Hero is split into two visual zones.

Left Side

approximately 60%

Right Side

approximately 40%

Left side contains:

Featured Event

Right side contains:

Stack of preview cards.

---

# Featured Event

This is the primary focus.

Large event title.

Example:

ANNUAL TECH FEST 2026

Below:

College Name

Date

Location

Category

Short description

CTA Button

View Event

Secondary Button

Explore Events

---

# Typography

Event title:

Very large

Bold

Uppercase

White

Strong letter spacing

Maximum two lines.

Subtitle:

Medium weight.

Body:

Light.

Buttons:

Semi-bold.

Everything uses modern sans-serif fonts.

---

# Hero Content Position

Content aligned left.

Placed approximately 15% from left edge.

Vertically centered.

Never perfectly centered.

More breathing space toward left.

---

# Event Description

Maximum:

3 lines.

Should fade if too long.

---

# CTA Buttons

Primary

Filled

Rounded

Shadow

Hover lifts upward.

Secondary

Glass button

Border

Transparent background

Blur.

---

# Right Side Event Cards

The right side contains multiple vertical cards.

Exactly like the reference.

Cards overlap slightly.

Cards are stacked horizontally.

Each card contains:

Event Image

Event Name

College

Date

Small Category Badge

Cards are tall.

Portrait orientation.

Rounded corners.

Soft shadow.

Glass information panel.

---

# Card Sizes

Large enough to clearly see the image.

Consistent width.

Consistent spacing.

Equal border radius.

---

# Active Card

Current event card:

Slightly larger.

Higher brightness.

Stronger shadow.

Moves slightly upward.

---

# Inactive Cards

Slightly darker.

Smaller.

Lower opacity.

Placed behind active card.

---

# Card Hover

On hover:

Lift upward.

Increase shadow.

Increase brightness.

Smooth scaling.

Duration approximately 300ms.

---

# Hero Animation

When changing featured event:

Background begins transition.

↓

Current title fades.

↓

Current description fades.

↓

Cards begin sliding.

↓

Active card moves.

↓

Background completes.

↓

New title fades in.

↓

New description fades in.

↓

Buttons fade.

Entire transition should feel continuous.

---

# Background Transition

Never abruptly switch images.

Use:

Cross fade

Zoom

Parallax

Slow movement

Duration:

Around 1 second.

Motion should feel cinematic.

---

# Card Animation

Cards slide horizontally.

Old active card moves backward.

New card comes forward.

Scale changes smoothly.

No sudden jumps.

---

# Text Animation

Title

Slides upward slightly.

Opacity:

0 → 100

Subtitle:

Appears slightly after title.

Buttons:

Appear last.

---

# Image Motion

Background image has:

Very slow zoom.

Almost unnoticeable.

Creates cinematic depth.

---

# Glassmorphism

Cards:

Semi-transparent.

Blur.

Soft border.

Very subtle.

Navigation after scrolling:

Glass.

Buttons:

Glass.

---

# Shadows

Soft.

Large blur.

No harsh edges.

Cards appear floating.

---

# Border Radius

Cards:

Large.

Buttons:

Medium.

Glass containers:

Large.

---

# Color Palette

Background

Dark charcoal.

Primary

Deep blue.

Accent

Cyan.

Secondary

Purple.

Success

Green.

Warning

Orange.

Text

White.

Muted text

Light gray.

---

# Event Categories

Each category has badge.

Examples:

Hackathon

Workshop

Festival

Sports

Seminar

Music

AI

Robotics

---

# Carousel Logic

Only one event is featured.

Other events remain visible.

Clicking another card:

Moves it to featured.

Updates:

Background

Title

Description

Buttons

Information

Cards

Everything animates together.

---

# Scroll Behaviour

The hero remains full screen.

Scrolling reveals:

Featured Events

Upcoming Events

Popular Colleges

Categories

Gallery

Testimonials

Footer

Hero should smoothly hand off into next section.

---

# Mouse Interaction

Moving mouse creates:

Very subtle parallax.

Background moves slightly.

Cards shift a few pixels.

Motion is extremely subtle.

---

# Loading Animation

Before homepage loads:

Background fades.

Cards appear.

Title appears.

Buttons appear.

Everything fades sequentially.

---

# Micro Interactions

Buttons

Lift.

Cards

Lift.

Navigation

Underline animation.

Links

Fade.

Images

Scale slightly.

Everything uses easing.

Nothing snaps.

---

# Responsiveness

Desktop

Same layout.

Tablet

Cards become smaller.

Hero text scales.

Mobile

Cards move below hero.

Navigation becomes hamburger.

Large title reduces size.

Buttons stack vertically.

---

# Accessibility

High contrast.

Keyboard navigation.

Visible focus states.

Reduced motion support.

Readable typography.

Alt text on images.

---

# Performance

Lazy load background images.

Optimize images.

Preload first hero image.

Animate using GPU-friendly transforms.

Avoid layout shifts.

---

# Homepage Component Hierarchy

HomePage

├── HeroSection

│   ├── BackgroundImage

│   ├── Overlay

│   ├── Navbar

│   ├── HeroContent

│   │   ├── Title

│   │   ├── Subtitle

│   │   ├── Description

│   │   ├── CTA Buttons

│   ├── EventCardCarousel

│   │   ├── EventCard

│   │   ├── EventCard

│   │   ├── EventCard

│   ├── NavigationControls

↓

Featured Events

↓

Upcoming Events

↓

College Showcase

↓

Gallery

↓

Testimonials

↓

Footer

---

# Motion Principles

Every animation should satisfy:

Smooth

Natural

Consistent

Elegant

Never abrupt.

Never bounce excessively.

Never use flashy animations.

Motion should guide the user's eyes naturally.

---

# Final Goal

The completed homepage should feel like a premium Apple-quality landing page that uses the same visual storytelling, layering, cinematic transitions, carousel behavior, and immersive experience as the reference animation, while presenting college events instead of travel destinations.

A user should immediately understand that this is a platform for discovering and participating in college events, without any travel-related terminology or imagery.