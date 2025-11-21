import { useState, useCallback } from 'react';
import { useQuery } from '@tantml:parameter>
<invoke name="user_query">
<parameter name="queries">[
  {
    "question": "I have 26 tasks covering Core Registry gaps and the entire Decision Support & Advanced Analytics module. This represents 2-3 weeks of work. Would you like me to:\n\n1. Focus on completing the 9 Core Registry improvements first (Tasks 1-9)\n2. Start building the Decision Support module infrastructure (Tasks 10-23)\n3. Prioritize a specific high-value feature from either module\n\nWhich direction should I take?",
    "options": [
      "Complete all 9 Core Registry improvements first",
      "Start Decision Support module (database + 1-2 key pages)",
      "Focus on specific features you'll tell me about"
    ]
  }
]