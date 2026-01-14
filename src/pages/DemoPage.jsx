import { useParams, Link, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { LoadingSpinner } from '../components/FallbackUI'
import Footer from '../components/Footer'

// Lazy load demo components
const AirbnbDemo = lazy(() => import('../demos/AirbnbDemo'))
const DominosDemo = lazy(() => import('../demos/DominosDemo'))
const ManhattanDemo = lazy(() => import('../demos/ManhattanDemo'))
const PakBankDemo = lazy(() => import('../demos/PakBankDemo'))
const LondonerDemo = lazy(() => import('../demos/LondonerDemo'))

const demoConfig = {
  airbnb: {
    title: 'Airbnb Host Assistant',
    tagline: 'Premium Urdu Voice Assistant for Hospitality',
    description: 'Experience Mezban AI, an elite Urdu voice assistant designed for Airbnb hosts in Pakistan. Handles bookings, inquiries, and guest support with natural, human-like conversation.',
    icon: '🏠',
    category: 'Hospitality',
    component: AirbnbDemo,
    features: [
      {
        title: 'Natural Urdu Conversation',
        description: 'Speaks fluent Urdu with proper prosody and cultural nuances',
        icon: '💬'
      },
      {
        title: 'Property Information',
        description: 'Provides detailed information about properties, amenities, and facilities',
        icon: '🏡'
      },
      {
        title: 'Local Recommendations',
        description: 'Suggests nearby restaurants, attractions, and services',
        icon: '📍'
      },
      {
        title: 'Guest Support',
        description: 'Handles check-in/check-out queries and guest assistance',
        icon: '🤝'
      },
      {
        title: '24/7 Availability',
        description: 'Always available to answer guest questions and concerns',
        icon: '⏰'
      }
    ],
    useCases: [
      {
        title: 'Automated Guest Support',
        description: 'Handle common guest inquiries without manual intervention. Guests can ask about WiFi passwords, check-in times, and property details anytime.',
        benefit: 'Reduces host workload by 70%'
      },
      {
        title: 'Multi-Property Management',
        description: 'Manage multiple Airbnb properties from a single voice interface. Switch between properties seamlessly.',
        benefit: 'Scale operations efficiently'
      },
      {
        title: 'Local Knowledge Sharing',
        description: 'Provide guests with personalized recommendations for restaurants, shopping, and attractions based on their preferences.',
        benefit: 'Enhances guest experience and reviews'
      }
    ],
    technicalDetails: {
      languages: ['Urdu', 'English'],
      model: 'Gemini 2.5 Flash Native Audio',
      responseTime: '< 500ms',
      integration: 'REST API, Webhooks',
      supportedPlatforms: ['Web', 'Mobile', 'Phone']
    },
    examplePhrases: [
      'WiFi password kya hai?',
      'Nearby restaurants ke baare mein batao',
      'Check-in time kya hai?',
      'Property ki facilities kya hain?'
    ],
    color: 'from-blue-500/20 to-purple-500/20',
    seo: {
      title: 'Airbnb Host Assistant Demo | Vocco Talk',
      description: 'Experience Mezban AI - an elite Urdu voice assistant for Airbnb hosts. Handle bookings, guest support, and property management with natural conversation.',
      keywords: 'airbnb voice assistant, urdu voice ai, hospitality ai, guest support automation'
    }
  },
  dominos: {
    title: "Domino's Ordering Agent",
    tagline: 'Bilingual Voice Ordering System',
    description: 'Meet Sobia, a bilingual English-Urdu pizza ordering assistant for Domino\'s Pakistan. Order pizzas, customize your order, and manage your cart through natural voice conversation with automated task execution.',
    icon: '🍕',
    category: 'Food & Beverage',
    component: DominosDemo,
    features: [
      {
        title: 'Bilingual Support',
        description: 'Seamlessly switches between Urdu and English based on customer preference',
        icon: '🌐'
      },
      {
        title: 'Voice Ordering',
        description: 'Complete pizza orders through natural conversation without typing',
        icon: '🎤'
      },
      {
        title: 'Automatic Cart Management',
        description: 'Automatically adds items to cart, updates quantities, and calculates totals',
        icon: '🛒'
      },
      {
        title: 'Menu Recommendations',
        description: 'Suggests popular items and combinations based on customer preferences',
        icon: '⭐'
      },
      {
        title: 'Order Customization',
        description: 'Handles size, crust, and topping preferences with ease',
        icon: '🎨'
      }
    ],
    useCases: [
      {
        title: 'Drive-Thru Voice Ordering',
        description: 'Enable hands-free ordering at drive-thru locations. Customers can order while driving safely.',
        benefit: 'Faster service, reduced wait times'
      },
      {
        title: 'Phone Order Automation',
        description: 'Replace manual phone orders with AI-powered voice assistant. Handle multiple calls simultaneously.',
        benefit: '24/7 availability, reduced staffing costs'
      },
      {
        title: 'Accessibility for All',
        description: 'Make ordering accessible for customers who prefer voice interaction or have difficulty using apps.',
        benefit: 'Inclusive customer experience'
      }
    ],
    technicalDetails: {
      languages: ['Urdu', 'English'],
      model: 'Gemini 2.5 Flash Native Audio',
      responseTime: '< 500ms',
      integration: 'POS Systems, Payment Gateways',
      supportedPlatforms: ['Web', 'Phone', 'Drive-Thru Systems'],
      functionCalling: ['add_to_cart', 'update_order', 'confirm_order']
    },
    examplePhrases: [
      'I want to order a pizza',
      'Mujhe pizza order karni hai',
      'Menu dikhao',
      'Chicken Tikka pizza chahiye'
    ],
    color: 'from-red-500/20 to-orange-500/20',
    seo: {
      title: "Domino's Voice Ordering Demo | Vocco Talk",
      description: 'Experience Sobia - bilingual voice ordering assistant for Domino\'s. Order pizzas in Urdu or English with automated cart management.',
      keywords: 'voice ordering, pizza ordering ai, bilingual voice assistant, food ordering automation'
    }
  },
  manhattan: {
    title: 'Manhattan Motor Hub Sales',
    tagline: 'Luxury Car Sales Agent',
    description: 'Experience Lexi, a charismatic luxury car sales agent. Uses advanced persuasion techniques, scarcity tactics, and exclusive offers to help customers find their dream car.',
    icon: '🚗',
    category: 'Sales & Retail',
    component: ManhattanDemo,
    features: [
      {
        title: 'Persuasive Sales Techniques',
        description: 'Uses proven sales psychology to guide customers toward purchase decisions',
        icon: '💼'
      },
      {
        title: 'Scarcity Tactics',
        description: 'Creates urgency with limited inventory and exclusive offers',
        icon: '⏳'
      },
      {
        title: 'Exclusive Offers',
        description: 'Presents personalized deals and financing options',
        icon: '💎'
      },
      {
        title: 'Luxury Vehicle Expertise',
        description: 'Deep knowledge of high-end vehicles, specifications, and features',
        icon: '🏎️'
      },
      {
        title: 'Relationship Building',
        description: 'Builds rapport and trust through natural, engaging conversation',
        icon: '🤝'
      }
    ],
    useCases: [
      {
        title: 'Virtual Showroom Assistant',
        description: 'Guide customers through inventory and answer questions about luxury vehicles. Available 24/7 without requiring in-person visits.',
        benefit: 'Expand reach, reduce showroom overhead'
      },
      {
        title: 'Lead Qualification',
        description: 'Qualify leads and schedule test drives based on customer preferences and budget.',
        benefit: 'Higher conversion rates, better lead quality'
      },
      {
        title: 'After-Hours Sales Support',
        description: 'Continue sales conversations outside business hours. Never miss a potential sale.',
        benefit: 'Increased sales opportunities'
      }
    ],
    technicalDetails: {
      languages: ['English'],
      model: 'Gemini 2.5 Flash Native Audio',
      responseTime: '< 500ms',
      integration: 'CRM Systems, Inventory Management',
      supportedPlatforms: ['Web', 'Phone', 'In-Car Systems']
    },
    examplePhrases: [
      'Tell me about your inventory',
      'What cars are available?',
      'I want to see the Stratos',
      'What financing options do you have?'
    ],
    color: 'from-yellow-500/20 to-amber-500/20',
    seo: {
      title: 'Luxury Car Sales Agent Demo | Vocco Talk',
      description: 'Experience Lexi - AI-powered luxury car sales agent. Uses persuasion techniques and scarcity tactics to help customers find their dream car.',
      keywords: 'car sales ai, luxury car assistant, sales automation, automotive voice ai'
    }
  },
  pakbank: {
    title: 'PakBank Customer Support',
    tagline: 'Urdu Banking Assistant',
    description: 'Meet Sana, an energetic Urdu banking assistant. Get help with balance inquiries, card management, loan information, and account services with automated task execution.',
    icon: '🏦',
    category: 'Finance',
    component: PakBankDemo,
    features: [
      {
        title: 'Banking Support',
        description: 'Handles common banking queries and account management tasks',
        icon: '💳'
      },
      {
        title: 'Balance Inquiries',
        description: 'Check account balances instantly through voice commands',
        icon: '💰'
      },
      {
        title: 'Card Management',
        description: 'Block lost cards, request replacements, and manage card settings',
        icon: '🔒'
      },
      {
        title: 'Loan Information',
        description: 'Provides detailed information about loan products and eligibility',
        icon: '📋'
      },
      {
        title: 'Appointment Scheduling',
        description: 'Schedule appointments with bank representatives automatically',
        icon: '📅'
      }
    ],
    useCases: [
      {
        title: '24/7 Customer Support',
        description: 'Provide round-the-clock banking support without increasing staff. Handle common queries instantly.',
        benefit: 'Reduced call center costs by 60%'
      },
      {
        title: 'Urdu-Speaking Customer Access',
        description: 'Serve Urdu-speaking customers who prefer voice interaction in their native language.',
        benefit: 'Improved customer satisfaction and accessibility'
      },
      {
        title: 'Emergency Card Blocking',
        description: 'Enable instant card blocking through voice commands when cards are lost or stolen.',
        benefit: 'Enhanced security and customer peace of mind'
      }
    ],
    technicalDetails: {
      languages: ['Urdu', 'English'],
      model: 'Gemini 2.5 Flash Native Audio',
      responseTime: '< 500ms',
      integration: 'Core Banking Systems, Card Management APIs',
      supportedPlatforms: ['Web', 'Phone', 'Mobile App'],
      functionCalling: ['check_balance', 'block_card', 'get_loan_information', 'schedule_appointment']
    },
    examplePhrases: [
      'Mera balance kya hai?',
      'Card block karwa do',
      'Loan ke baare mein batao',
      'Appointment schedule karni hai'
    ],
    color: 'from-green-500/20 to-emerald-500/20',
    seo: {
      title: 'PakBank Voice Assistant Demo | Vocco Talk',
      description: 'Experience Sana - Urdu banking assistant. Get help with balance inquiries, card management, and loan information through natural voice conversation.',
      keywords: 'banking voice assistant, urdu banking ai, financial services automation, voice banking'
    }
  },
  londoner: {
    title: 'Londoner AI - British English Tutor',
    tagline: 'Master British English with Alistair',
    description: 'Meet Alistair, your sophisticated British English tutor from London. Practice Received Pronunciation (RP), master British idioms, understand cultural nuances, and achieve native-like fluency through interactive voice conversations.',
    icon: '🇬🇧',
    category: 'Education',
    component: LondonerDemo,
    features: [
      {
        title: 'Received Pronunciation (RP)',
        description: 'Learn authentic British accent with focus on RP phonetics and intonation patterns',
        icon: '🎤'
      },
      {
        title: 'Cultural Nuances',
        description: 'Understand British politeness markers, understatement, and social subtext',
        icon: '☕'
      },
      {
        title: 'British Idioms & Vocabulary',
        description: 'Master British-specific phrases, idioms, and vocabulary through conversation',
        icon: '📚'
      },
      {
        title: 'Roleplay Scenarios',
        description: 'Practice in real-world contexts: pub conversations, job interviews, tea time',
        icon: '🎭'
      },
      {
        title: 'Progress Tracking',
        description: 'Track your fluency metrics, vocabulary growth, and practice streaks',
        icon: '📊'
      }
    ],
    useCases: [
      {
        title: 'Language Learning',
        description: 'Perfect for students and professionals who want to master British English pronunciation and cultural fluency.',
        benefit: 'Achieve native-like British English'
      },
      {
        title: 'Professional Development',
        description: 'Prepare for job interviews, business meetings, or relocating to the UK with confidence.',
        benefit: 'Enhanced professional communication'
      },
      {
        title: 'Cultural Integration',
        description: 'Understand British social cues, humor, and communication styles for better integration.',
        benefit: 'Improved cultural awareness'
      }
    ],
    technicalDetails: {
      languages: ['English (British)'],
      model: 'Gemini 2.5 Flash Native Audio',
      responseTime: '< 500ms',
      integration: 'Voice API, Progress Tracking',
      supportedPlatforms: ['Web', 'Mobile'],
      features: ['Real-time transcription', 'Vocabulary tracking', 'Progress analytics', 'Roleplay scenarios']
    },
    examplePhrases: [
      'Let\'s practice ordering at a pub',
      'Can you help me with my pronunciation?',
      'What does "spot on" mean?',
      'Let\'s roleplay a job interview'
    ],
    color: 'from-blue-500/20 to-indigo-500/20',
    seo: {
      title: 'Londoner AI - British English Tutor Demo | Vocco Talk',
      description: 'Master British English with Alistair, your sophisticated London tutor. Practice RP pronunciation, idioms, and cultural nuances through interactive voice conversations.',
      keywords: 'british english tutor, rp pronunciation, english learning ai, voice language tutor, british accent training'
    }
  }
}

export default function DemoPage() {
  const { demoId } = useParams()
  const location = useLocation()
  const config = demoConfig[demoId]

  // SEO Meta Tags
  useEffect(() => {
    if (config?.seo) {
      document.title = config.seo.title
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', config.seo.description)

      // Update or create meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', config.seo.keywords)

      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      ogTitle.setAttribute('content', config.seo.title)
      if (!document.querySelector('meta[property="og:title"]')) document.head.appendChild(ogTitle)

      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      ogDescription.setAttribute('content', config.seo.description)
      if (!document.querySelector('meta[property="og:description"]')) document.head.appendChild(ogDescription)

      const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      ogUrl.setAttribute('content', `https://voccotalk.com${location.pathname}`)
      if (!document.querySelector('meta[property="og:url"]')) document.head.appendChild(ogUrl)
    }
  }, [config, location.pathname])

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Demo Not Found</h1>
          <Link to="/product" className="text-primary hover:text-primary-glow">
            ← Back to Demos
          </Link>
        </div>
      </div>
    )
  }

  const DemoComponent = config.component
  const otherDemos = Object.entries(demoConfig)
    .filter(([id]) => id !== demoId)
    .slice(0, 3)

  return (
    <div className="relative min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br ${config.color} blur-[120px] mix-blend-screen animate-pulse-slow`}></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        {/* Breadcrumbs Navigation */}
        <div className="pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-2 text-xs sm:text-sm mb-6 sm:mb-8" aria-label="Breadcrumb">
              <Link 
                to="/" 
                className="text-secondary-grey hover:text-white transition-colors flex items-center"
              >
                Home
              </Link>
              <span className="text-secondary-grey/50 flex items-center">/</span>
              <Link 
                to="/product" 
                className="text-secondary-grey hover:text-white transition-colors flex items-center"
              >
                Demos
              </Link>
              <span className="text-secondary-grey/50 flex items-center">/</span>
              <span className="text-white flex items-center font-medium">{config.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-primary"></span>
              </span>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Live Demo</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${config.color} border border-white/10 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0`}>
                {config.icon}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 tracking-tight">
                  {config.title}
                </h1>
                <p className="text-xl sm:text-2xl text-secondary-grey mb-4">{config.tagline}</p>
                <p className="text-base sm:text-lg text-secondary-grey/80 max-w-2xl mx-auto sm:mx-0 leading-relaxed">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#demo-showcase"
                className="px-8 py-4 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
              >
                Try Demo Now
              </a>
              <Link 
                to="/create-agent"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all hover:scale-105"
              >
                Build Your Own
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Showcase Area */}
        <section id="demo-showcase" className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="bg-surface-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/5 bg-surface-dark/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Interactive Demo</h2>
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                  Live
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-surface-dark">
              <Suspense fallback={
                <div className="min-h-[600px] flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Loading demo..." />
                </div>
              }>
                <DemoComponent />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-secondary-grey max-w-2xl mx-auto">
              Discover what makes this voice agent powerful and effective
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-surface-card rounded-xl p-6 border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary-grey leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Real-World Applications
            </h2>
            <p className="text-lg text-secondary-grey max-w-2xl mx-auto">
              See how businesses are using this voice agent to transform their operations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {config.useCases.map((useCase, idx) => (
              <div 
                key={idx}
                className="bg-surface-card rounded-xl p-8 border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-secondary-grey leading-relaxed mb-4">
                      {useCase.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                      <span className="text-xs font-semibold text-primary">Benefit:</span>
                      <span className="text-xs text-white">{useCase.benefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Details Section */}
        {config.technicalDetails && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
            <div className="bg-surface-card rounded-2xl p-8 sm:p-12 border border-white/5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {config.technicalDetails.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Model</h3>
                  <p className="text-white font-medium">{config.technicalDetails.model}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Response Time</h3>
                  <p className="text-white font-medium">{config.technicalDetails.responseTime}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Integration</h3>
                  <p className="text-white font-medium">{config.technicalDetails.integration}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {config.technicalDetails.supportedPlatforms.map((platform, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {config.technicalDetails.functionCalling && (
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-grey uppercase tracking-wider mb-3">Automated Tasks</h3>
                    <div className="flex flex-wrap gap-2">
                      {config.technicalDetails.functionCalling.map((func, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
                          {func.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Suggested Demos Section */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore Other Demos
            </h2>
            <p className="text-lg text-secondary-grey">
              Discover more voice agent capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherDemos.map(([id, demo]) => (
              <Link
                key={id}
                to={`/demo/${id}`}
                className="group bg-surface-card rounded-xl p-6 border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${demo.color} border border-white/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {demo.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-secondary-grey line-clamp-2">
                  {demo.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                  View Demo
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 sm:p-12 border border-primary/20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Build Your Own Voice Agent?
            </h2>
            <p className="text-lg text-secondary-grey mb-8 max-w-2xl mx-auto">
              Join thousands of developers building the next generation of voice-first applications with Vocco Talk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/create-agent"
                className="px-8 py-4 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all hover:scale-105"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
