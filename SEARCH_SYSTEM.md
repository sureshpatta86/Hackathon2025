# Advanced Search & Filtering System

This document describes the implementation of the advanced search and filtering functionality for the HealthComm dashboard.

## Features Implemented

### 🔍 Global Search
- **Multi-entity search**: Search across patients, templates, and communications simultaneously
- **Real-time results**: Search results appear as you type with 300ms debouncing
- **Smart categorization**: Results are tagged by type (Patient 👤, Template 📄, Communication 💬)
- **Content preview**: Shows title, subtitle, and content preview for each result
- **Click-outside-to-close**: Intuitive UI behavior

### 🎛️ Advanced Filters
- **Date Range**: Filter communications by sent date range
- **Status Filter**: Filter by communication status (PENDING, DELIVERED, FAILED, SENT)
- **Communication Type**: Filter by SMS or VOICE communications
- **Patient Preferences**: Filter patients by SMS/Voice enabled status
- **Template Type**: Filter templates by communication type

### 💾 Saved Filter Presets
- **Save Current Filters**: Convert current filter state into a reusable preset
- **Named Presets**: Give presets descriptive names and optional descriptions
- **Quick Load**: Apply saved presets with one click
- **Persistent Storage**: Presets saved to localStorage for persistence
- **Preset Management**: Delete unused presets

## Technical Implementation

### Component Architecture
```
src/components/search/
├── GlobalSearch.tsx          # Main search input and results
├── AdvancedFilters.tsx       # Filter modal with all options
└── index.ts                  # Export barrel file

src/hooks/
└── useAdvancedSearch.ts      # Search state management hook

src/lib/
├── searchService.ts          # Search logic and API calls
└── searchExamples.ts         # Usage examples

src/types/
└── search.ts                # TypeScript interfaces
```

### Key Components

#### GlobalSearch Component
- Handles search input and result display
- Debounced search execution
- Result categorization and display
- Filter toggle button with active indicator

#### AdvancedFilters Component
- Modal-based filter interface
- All filter options in organized sections
- Preset management UI
- Clear all filters functionality

#### useAdvancedSearch Hook
- Centralized search state management
- Preset CRUD operations
- Filter application logic
- Active filter detection

#### SearchService Class
- Multi-entity search implementation
- Filter application logic
- Result formatting and limits
- Preset persistence management

### Data Flow

1. **Search Input**: User types in GlobalSearch input
2. **Debouncing**: 300ms delay before search execution
3. **API Calls**: Parallel fetches to /api/patients, /api/templates, /api/communications
4. **Filtering**: Apply search query and active filters to results
5. **Formatting**: Convert results to standardized SearchResult format
6. **Display**: Show categorized results in dropdown

### Filter Types

```typescript
interface FilterConfig {
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  communicationType?: string[];
  patientEnabled?: {
    sms?: boolean;
    voice?: boolean;
  };
  templateType?: string[];
}
```

## Usage Examples

### Basic Search
```typescript
// Search for patients named "John"
searchQuery: "John"

// Results will include:
// - Patients with "John" in first/last name
// - Communications sent to John
// - Templates containing "John"
```

### Advanced Filtering
```typescript
// Find failed SMS messages from last week
{
  status: ["FAILED"],
  communicationType: ["SMS"],
  dateRange: {
    start: "2025-06-13",
    end: "2025-06-20"
  }
}
```

### Preset Management
```typescript
// Save current filters as preset
savePreset("Failed SMS Messages", "Show only failed SMS communications");

// Load preset
loadPreset(savedPreset);

// Delete preset
deletePreset(presetId);
```

## Performance Considerations

- **Debounced Search**: Prevents excessive API calls
- **Result Limiting**: Maximum 50 results to prevent UI lag
- **Efficient Filtering**: Client-side filtering after data fetch
- **Cached Presets**: LocalStorage for preset persistence

## Future Enhancements

1. **Server-side Search**: Move search logic to backend for better performance
2. **Search Indexing**: Implement proper search indexing for large datasets
3. **Search History**: Track and suggest recent searches
4. **Advanced Operators**: Support for AND/OR/NOT search operators
5. **Export Results**: Allow exporting search results
6. **Real-time Updates**: WebSocket integration for live search results

## Installation & Usage

The search functionality is already integrated into the dashboard. Simply:

1. Navigate to the dashboard
2. Use the search bar at the top to search across all entities
3. Click the "Filters" button to access advanced filtering
4. Save frequently used filters as presets for quick access

## API Integration

The search system integrates with existing API endpoints:
- `GET /api/patients` - Patient data
- `GET /api/templates` - Template data  
- `GET /api/communications` - Communication data

No additional API endpoints required for basic functionality.
