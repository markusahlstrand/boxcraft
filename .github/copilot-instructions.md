# Boxcraft Project Context

This document provides essential context about the Boxcraft project, its architecture, and key implementation details.

## Project Overview

Boxcraft is a web application for designing simple 3D boxes with customizable dimensions, thickness, and edge joints. Users can preview their box in 3D and export the design as a DXF file for manufacturing or laser cutting.

## Tech Stack

- **Vite** for fast development and build
- **React** (with TypeScript) for UI
- **Tailwind CSS** for styling
- **shadcn-ui** for accessible UI components (Radix UI based)
- **Three.js** for 3D rendering
- **dxf-writer** for DXF export
- **React Query** for data management (future extensibility)

## Key Features

- Interactive 3D box preview (Three.js)
- Customizable box parameters: width, height, depth, thickness, units (mm/inch), and joint type (flat/finger)
- Real-time UI controls for all parameters
- Export to DXF (front face outline)
- Modern, accessible UI with shadcn-ui components
- Toast notifications for user feedback

## Main Components

- `BoxControls`: Sidebar form for editing box parameters and triggering export
- `BoxViewer`: 3D preview of the box, updates live as parameters change
- `Box` (model): Generates Three.js meshes for the box, supports different joint types
- `Index` page: Main layout, connects controls and viewer
- UI primitives: Button, Input, Select, Toast, etc. (from shadcn-ui)

## File Structure Highlights

- `src/pages/Index.tsx`: Main page, glues together controls and viewer
- `src/components/BoxControls.tsx`: Parameter controls
- `src/components/BoxViewer.tsx`: 3D rendering
- `src/models/Box.ts`: Box mesh logic
- `src/components/ui/`: shadcn-ui primitives
- `src/hooks/use-toast.ts`: Toast notification logic

## Usage

- Start with `npm run dev` (see README for details)
- Edit box parameters in the sidebar
- Preview updates in real time
- Click 'Export DXF' to download a DXF file

## Extensibility

- Add new joint types by extending `Box.ts`
- Add new export formats by adding new export handlers in `Index.tsx`
- UI is component-based and easy to extend

## Design Principles

- Keep UI minimal and accessible
- Use composition and hooks for logic reuse
- Prefer shadcn-ui for consistent, accessible components
- All code is TypeScript-first
