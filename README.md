# VoiceAgents Website

A modern React website built with Vite, Tailwind CSS, and React Router.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

The development server is already running! Visit:

**http://localhost:5173**

To start the server manually:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
vocco talk final/
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Navigation header
│   │   └── Footer.jsx      # Site footer
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   ├── Product.jsx     # Product showcase page
│   │   ├── Blog.jsx        # Blog listing page
│   │   └── Contact.jsx     # Contact form page
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles & Tailwind
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## 🎨 Features

- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Responsive Design** - works on all devices
- **Dark Theme** with beautiful gradients
- **Smooth Animations** and transitions
- **Material Icons** integration

## 📄 Pages

- `/` - Home/Landing page
- `/product` - Product showcase
- `/blog` - Blog listing
- `/contact` - Contact form

## 🛠️ Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- Tailwind CSS 3
- Material Symbols Icons

## 🎤 Voice Agent Demos

The Product page (`/product`) now showcases 4 live voice agent demos:

1. **PakBank Voice Assistant** - Urdu banking support agent (Sana)
2. **Domino's Pakistan** - Multilingual pizza ordering assistant (Sobia)
3. **Manhattan Motor Hub** - Luxury car sales agent (Lexi)
4. **Urdu Airbnb Host** - Premium hospitality assistant (Mezban AI)

### Setting Up Voice Agents

To use the voice agent demos, you need a Google Gemini API key:

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Create a `.env.local` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the development server

**Note:** The `.env.local` file is gitignored and won't be committed to version control.

## 📝 Notes

The original HTML files (index.html, product.html, blog.html, contact.html) have been preserved but are not used by the React app. The React components contain the same content and styling.

The voice agent demos are located in `src/demos/` and use the `@google/genai` package for real-time voice interactions.

# Test deployment - Wed Jan  7 23:54:15 PKT 2026
