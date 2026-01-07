/**
 * Pre-built voice interaction examples
 * These demonstrate common interaction patterns
 */

export const voiceExamples = [
  {
    id: 'customer-support',
    title: 'Customer Support Interaction',
    description: 'Example of a customer support conversation',
    agentName: 'Support Agent',
    interactions: [
      {
        user: "Hi, I'm having trouble with my order",
        agent: "Hello! I'm sorry to hear you're having issues. I'd be happy to help you with your order. Can you please provide your order number?",
        timestamp: 0
      },
      {
        user: "It's order #12345",
        agent: "Thank you. Let me look that up for you. I can see your order was shipped yesterday and should arrive by Friday. Is there a specific issue you're experiencing?",
        timestamp: 5
      },
      {
        user: "I haven't received a tracking number",
        agent: "I understand your concern. Let me send you the tracking information right away. You should receive an email with the tracking details within the next few minutes.",
        timestamp: 10
      }
    ]
  },
  {
    id: 'sales-assistant',
    title: 'Sales Conversation',
    description: 'Example of a sales assistant interaction',
    agentName: 'Sales Assistant',
    interactions: [
      {
        user: "I'm looking for a new laptop",
        agent: "Great! I'd love to help you find the perfect laptop. What will you primarily be using it for? Work, gaming, or general use?",
        timestamp: 0
      },
      {
        user: "Mostly for work and video editing",
        agent: "Perfect! For video editing, I'd recommend our Pro series with at least 16GB RAM and a dedicated graphics card. What's your budget range?",
        timestamp: 6
      },
      {
        user: "Around $1500",
        agent: "Excellent! I have a few options in that range that would be perfect for video editing. The ProBook 15 with 16GB RAM and RTX 3050 is currently on sale for $1,499. Would you like to hear more about its features?",
        timestamp: 12
      }
    ]
  },
  {
    id: 'personal-tutor',
    title: 'Tutoring Session',
    description: 'Example of an educational interaction',
    agentName: 'Math Tutor',
    interactions: [
      {
        user: "I'm struggling with quadratic equations",
        agent: "No worries! Quadratic equations can be tricky at first, but we'll work through this together. Do you understand the general form: ax² + bx + c = 0?",
        timestamp: 0
      },
      {
        user: "Yes, I understand that part",
        agent: "Great! Now, there are several methods to solve them. The most common is factoring. Let's start with a simple example: x² + 5x + 6 = 0. Can you think of two numbers that multiply to 6 and add to 5?",
        timestamp: 8
      },
      {
        user: "2 and 3?",
        agent: "Exactly right! So we can factor it as (x + 2)(x + 3) = 0. This means x = -2 or x = -3. You're getting it!",
        timestamp: 15
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare Assistant',
    description: 'Example of a healthcare information interaction',
    agentName: 'Health Assistant',
    interactions: [
      {
        user: "What are the symptoms of a common cold?",
        agent: "Common cold symptoms typically include a runny or stuffy nose, sneezing, sore throat, cough, mild headache, and sometimes a low-grade fever. These usually develop gradually over a few days.",
        timestamp: 0
      },
      {
        user: "How long does it usually last?",
        agent: "Most colds resolve within 7 to 10 days, though some symptoms like a cough can persist for up to 2 weeks. If symptoms worsen or persist longer, I'd recommend consulting with a healthcare professional.",
        timestamp: 8
      },
      {
        user: "What can I do to feel better?",
        agent: "Rest, stay hydrated, use a humidifier, and consider over-the-counter remedies for specific symptoms. However, for personalized medical advice, please consult with your doctor.",
        timestamp: 15
      }
    ]
  }
];

/**
 * Get example by ID
 */
export function getExampleById(id) {
  return voiceExamples.find(ex => ex.id === id);
}

/**
 * Get all examples
 */
export function getAllExamples() {
  return voiceExamples;
}

