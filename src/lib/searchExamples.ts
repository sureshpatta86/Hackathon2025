// Example usage of the Advanced Search & Filtering system

// The search system now includes:

// 1. Global Search Bar
//    - Searches across patients, templates, and communications
//    - Real-time search with debouncing
//    - Search results dropdown with type indicators

// 2. Advanced Filters
//    - Date range filtering for communications
//    - Status filtering (PENDING, DELIVERED, FAILED, SENT)
//    - Communication type filtering (SMS, VOICE)
//    - Patient preferences (SMS enabled, Voice enabled)
//    - Template type filtering

// 3. Saved Filter Presets
//    - Save current filter combinations with custom names
//    - Load saved presets quickly
//    - Delete unused presets
//    - Presets stored in localStorage

// Example Filter Presets:
const examplePresets = [
  {
    name: "Failed SMS Messages",
    description: "Show only failed SMS communications",
    filters: {
      status: ["FAILED"],
      communicationType: ["SMS"]
    }
  },
  {
    name: "Recent Voice Calls",
    description: "Voice communications from last 7 days",
    filters: {
      communicationType: ["VOICE"],
      dateRange: {
        start: "2025-06-13", // 7 days ago
        end: "2025-06-20"   // today
      }
    }
  },
  {
    name: "SMS-Enabled Patients",
    description: "Patients who have SMS enabled",
    filters: {
      patientEnabled: {
        sms: true
      }
    }
  }
];

// Search Examples:
// - Type "John" to find all patients named John
// - Type "appointment" to find templates containing "appointment"
// - Type "reminder" to find communications with "reminder" text
// - Use filters to narrow down results by date, status, type, etc.

export { examplePresets };
