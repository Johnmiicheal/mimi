# ✈️ AI Travel Planner

An intelligent travel planning assistant built for the AI London 2026 Hackathon (AI Agents Track). This application combines multi-agent AI systems with an innovative inline UI approach to create interactive, personalized travel itineraries.

![AI Travel Planner](https://img.shields.io/badge/AI-Travel%20Planner-blue?style=for-the-badge&logo=openai)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## 🌟 Key Features

### 1. **Inline Generative UI**
AI-generated messages contain interactive controls that users can adjust directly in the conversation:
- Number steppers for travelers/nights
- Price steppers for budget
- Date pickers for departure dates
- Country selectors
- Sliders for ranges
- Toggle chips and selects

**Syntax Example:**
```
Plan a {{+[nights]-}} night trip to {{::country[destination]}} for {{+[travelers]-}} travelers with a budget of {{+[$budget]-}} per person.
```

### 2. **Multi-Agent AI System (Mastra)**
Five specialized agents work together under a supervisor coordinator:

- **Flight Scout** - Searches and compares flight options
- **Hotel Hunter** - Finds optimally located accommodations
- **Activity Finder** - Discovers activities and creates daily schedules
- **Food Expert** - Recommends restaurants matching dietary needs
- **Budget Optimizer** - Analyzes costs and suggests optimizations

Each agent has:
- Real Zod-validated tools
- Mock data for demos
- Production-ready structure
- Delegation hooks for coordination

### 3. **Drag-and-Drop Kanban Board**
Reorganize your itinerary with ease:
- Drag activities between days
- Reorder within a single day
- Edit activity details
- Delete unwanted activities
- Real-time time calculations
- Warnings for overpacked days (>10 hours)

### 4. **Smart Replanning**
When you adjust inline controls, the AI automatically regenerates your plan:
- Debounced updates (1.5s delay)
- Maintains conversation context
- Only regenerates affected sections
- Visual feedback with updating indicator

### 5. **Calendar Export**
Export your complete itinerary:
- Generates standard ICS files
- Works with Google Calendar, Apple Calendar, Outlook
- Includes all activity details, times, and locations

### 6. **Rich Agent UI Components**
Specialized visualizations for each agent's output:
- Flight comparison cards
- Hotel recommendations with maps
- Daily timeline views
- Restaurant lists with filters
- Budget breakdown charts

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- (Optional) Anthropic API key for real AI responses

### Installation

1. Clone the repository:
```bash
cd travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Demo Mode
The app works without an API key! It will use pre-generated demo responses to showcase all features.

## 📁 Project Structure

```
travel-planner/
├── app/
│   ├── page.tsx                 # Main chat interface
│   ├── itinerary/page.tsx       # Kanban board demo
│   └── api/plan-trip/route.ts   # AI agent endpoint
├── components/
│   ├── inline-ui/               # Interactive inline controls
│   │   ├── NumberStepper.tsx
│   │   ├── PriceStepper.tsx
│   │   ├── DatePicker.tsx
│   │   ├── CountryPicker.tsx
│   │   ├── Slider.tsx
│   │   ├── Select.tsx
│   │   ├── ToggleChip.tsx
│   │   └── VotingButtons.tsx
│   ├── agent-ui/                # Agent output components
│   │   ├── FlightComparison.tsx
│   │   ├── HotelCard.tsx
│   │   ├── DailyTimeline.tsx
│   │   ├── RestaurantList.tsx
│   │   └── BudgetBreakdown.tsx
│   └── kanban/                  # Drag-and-drop board
│       ├── KanbanBoard.tsx
│       ├── KanbanColumn.tsx
│       └── KanbanCard.tsx
├── lib/
│   ├── agents/                  # Mastra AI agents
│   │   ├── travel-coordinator.ts
│   │   ├── flight-scout.ts
│   │   ├── hotel-hunter.ts
│   │   ├── activity-finder.ts
│   │   ├── food-expert.ts
│   │   └── budget-optimizer.ts
│   ├── inline-ui/
│   │   ├── parser.tsx           # Parses inline syntax
│   │   └── renderer.tsx         # Renders components
│   ├── hooks/
│   │   └── useReplan.ts         # Replan logic
│   └── utils/
│       └── calendar-export.ts   # ICS file generation
└── public/
```

## 🎯 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI Framework:** Mastra (multi-agent orchestration)
- **AI Provider:** Anthropic Claude 3.5 Sonnet
- **AI SDK:** Vercel AI SDK
- **Drag & Drop:** @dnd-kit
- **UI Components:** Radix UI
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons
- **Date Handling:** date-fns

## 🎨 Design Philosophy

### Clean Blue Theme
- No flashy gradients or animated backgrounds
- Professional, minimalist aesthetic
- ChatGPT-style interface
- Glass morphism effects
- Smooth, subtle animations

### Inline UI Innovation
Unlike traditional chatbots with separate forms, AI-generated controls appear **inside** the conversation:
- More natural and conversational
- Immediate visual feedback
- No context switching
- Adjustments trigger smart replanning

## 🔧 Configuration

### Agent Instructions
Each agent has customizable instructions in `lib/agents/*.ts`. Modify these to change:
- Output format
- Delegation strategy
- Tool usage patterns
- Response style

### Inline UI Syntax
Add new control types by:
1. Creating component in `components/inline-ui/`
2. Adding pattern to `lib/inline-ui/parser.tsx`
3. Adding renderer in `lib/inline-ui/renderer.tsx`

Example pattern:
```typescript
const patterns = {
  myControl: /\{\{::mycontrol\[([a-zA-Z0-9_]+)\]\}\}/g,
};
```

## 📊 Current Progress

### Completed (80%)
✅ Foundation & setup
✅ All 8 inline UI components
✅ All 5 agent UI components
✅ Complete multi-agent system
✅ Kanban board with drag-drop
✅ Calendar export (ICS)
✅ Smart replanning
✅ Mock data for demos

### In Progress / Future
🔄 Real-time collaboration (Liveblocks)
🔄 Comprehensive testing
🔄 Production deployment

## 🤝 Contributing

This project was built for the AI London 2026 Hackathon. Contributions, issues, and feature requests are welcome!

## 📝 License

MIT License - feel free to use this project for your own hackathons or learning!

## 🙏 Acknowledgments

- Built with [Mastra](https://mastra.ai) - Multi-agent orchestration
- Powered by [Claude 3.5 Sonnet](https://anthropic.com)
- UI components from [Radix UI](https://radix-ui.com)
- Drag-and-drop by [@dnd-kit](https://dndkit.com)

## 📞 Contact

Built by John Micheal for AI London 2026 Hackathon

---

**Made with ❤️ for the AI Agents track at AI London 2026**
