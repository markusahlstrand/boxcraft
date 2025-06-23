# Boxcraft

A web application for designing simple 3D boxes with customizable dimensions, thickness, and edge joints. Users can preview their box in real-time 3D and export the design as a DXF file for manufacturing or laser cutting.

## Features

- **Interactive 3D Preview**: Real-time visualization of your box design using Three.js
- **Customizable Parameters**: Adjust width, height, depth, thickness, units (mm/inch), and joint type (flat/finger joints)
- **Live Updates**: See changes instantly as you modify parameters
- **DXF Export**: Export your design for laser cutting or CNC machining. This might not be up to date..

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd boxcraft

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Technology Stack

- **Vite** - Fast development and build tool
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **Three.js** - 3D rendering and visualization
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - Accessible UI components (built on Radix UI)
- **dxf-writer** - DXF file generation for CAD export

## Project Structure

```
src/
├── components/
│   ├── BoxControls.tsx    # Parameter controls sidebar
│   ├── BoxViewer.tsx      # 3D rendering component
│   └── ui/                # shadcn-ui components
├── models/
│   ├── Box.ts             # Box mesh generation logic
│   └── FingerBoard.ts     # Finger joint calculations
├── pages/
│   └── Index.tsx          # Main application page
└── hooks/
    └── use-toast.ts       # Toast notification hook
```

## Usage

1. **Set Parameters**: Use the sidebar controls to adjust box dimensions, thickness, and joint type
2. **Preview**: View your design in real-time 3D
3. **Export**: Click "Export DXF" to download a file ready for laser cutting or CNC machining

## Development

The project uses modern development practices:

- TypeScript for type safety
- Component-based architecture
- Real-time 3D updates
- Accessible UI components
- Toast notifications for user feedback

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

This project's initial structure was generated using Lovable, then extended and refined through collaborative coding with various AI assistants in VS Code.

## License

MIT License

Copyright (c) 2025 Boxcraft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
