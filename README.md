# Workflow Builder - Visual Workflow Design Tool

A powerful visual workflow builder with drag-and-drop interface, node-based editing, and real-time execution capabilities for creating complex automation workflows.

## Overview

Workflow Builder is a sophisticated web application that provides a visual interface for creating, editing, and managing complex automation workflows. Built with Next.js and ReactFlow, it offers an intuitive drag-and-drop experience with node-based editing, real-time execution capabilities, and comprehensive workflow management features.

## Features

- **Visual Workflow Design**: Drag-and-drop interface for creating complex workflows
- **Node-Based Editing**: Comprehensive node library with various workflow components
- **Real-Time Execution**: Live workflow execution and monitoring capabilities
- **Code Editor Integration**: Built-in code editor for custom node configurations
- **Conditional Logic**: Support for conditional nodes and branching workflows
- **Input/Output Management**: Flexible input and output node configurations
- **Process Automation**: Automated process nodes for common workflow tasks
- **Custom Edges**: Customizable connections between workflow nodes
- **Node Configuration**: Detailed configuration panels for each node type
- **Responsive Design**: Fully responsive interface that works on all devices
- **Modern UI**: Clean, professional interface built with shadcn/ui components

## Technology Stack

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features and performance improvements
- **TypeScript**: Full type safety and better development experience
- **ReactFlow**: Powerful library for building node-based editors
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: High-quality, accessible UI components
- **Radix UI**: Unstyled, accessible UI primitives
- **Geist Fonts**: Modern typography with Geist Sans and Geist Mono
- **Vercel Analytics**: Performance monitoring and analytics

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/bjornleonhenry/workflow-builder.git
cd workflow-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
workflow-builder/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main workflow builder page
├── components/            # React components
│   ├── workflow-builder.tsx # Main workflow builder component
│   ├── code-editor.tsx    # Code editor component
│   ├── custom-edge.tsx    # Custom edge component
│   ├── node-config-panel.tsx # Node configuration panel
│   ├── node-library.tsx   # Node library component
│   ├── nodes/            # Node type components
│   │   ├── code-node.tsx # Code execution node
│   │   ├── conditional-node.tsx # Conditional logic node
│   │   ├── input-node.tsx # Input data node
│   │   ├── output-node.tsx # Output data node
│   │   └── process-node.tsx # Process automation node
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── types.ts         # TypeScript type definitions
│   ├── utils.ts         # General utility functions
│   └── workflow-utils.ts # Workflow-specific utilities
└── public/               # Static assets
```

## Features Overview

### Workflow Builder Interface
- **Canvas**: Interactive canvas for building workflows
- **Node Library**: Comprehensive library of workflow nodes
- **Configuration Panel**: Detailed configuration for each node
- **Code Editor**: Built-in code editor for custom logic
- **Execution Engine**: Real-time workflow execution

### Node Types
- **Input Nodes**: Data input and parameter configuration
- **Process Nodes**: Automated processing and transformation
- **Conditional Nodes**: Logic branching and decision making
- **Code Nodes**: Custom code execution and scripting
- **Output Nodes**: Data output and result handling

### Workflow Management
- **Save/Load**: Workflow persistence and management
- **Export/Import**: Workflow sharing and collaboration
- **Version Control**: Workflow versioning and history
- **Templates**: Pre-built workflow templates
- **Documentation**: Built-in workflow documentation

## Customization

### Adding New Node Types
1. Create new node component in `components/nodes/`
2. Add node type to the node library
3. Implement node configuration panel
4. Add node execution logic

### Extending Functionality
1. Add new workflow utilities in `lib/workflow-utils.ts`
2. Extend type definitions in `lib/types.ts`
3. Create custom edge types for specialized connections
4. Implement additional execution engines

### Styling
The project uses Tailwind CSS with a comprehensive design system. Key styling features:
- Consistent node styling and theming
- Responsive canvas and interface
- Custom edge styling and animations
- Dark/light theme support

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Workflow Engine (optional)
NEXT_PUBLIC_WORKFLOW_ENGINE_URL=your_workflow_engine_url
```

## Performance Features

- **Static Generation**: Pre-rendered pages for optimal performance
- **Code Splitting**: Automatic code splitting for faster loading
- **Canvas Optimization**: Optimized ReactFlow rendering
- **Memory Management**: Efficient node and edge management
- **Bundle Optimization**: Optimized JavaScript and CSS bundles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Preview

![Workflow Builder Preview](./public/workflow-builder.png)

## Live Demo

Visit the live demo: [https://workflow-builder.bjornleonhenry.com](https://workflow-builder.bjornleonhenry.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Bjorn Leon Henry**
- GitHub: [@bjornleonhenry](https://github.com/bjornleonhenry)
- Website: [https://bjornleonhenry.com](https://bjornleonhenry.com)
