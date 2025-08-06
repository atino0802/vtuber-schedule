
# Project Context for GitHub Copilot

This file is intended to provide GitHub Copilot with context about this VTuber streaming schedule integration project.

## 💡 Project Goal

The goal of this project is to create a webpage that aggregates VTuber stream schedules (starting with Hololive EN talents) using the Holodex API. The page displays upcoming streams categorized by group and generation, with the possibility of future features like Twitter feed integration.

## 🎯 Current Progress

- Successfully fetches real-time stream data using Holodex API
- VTuber data is modularized into a separate vtubers.js file
- Each VTuber has metadata including group, generation, and retired status
- Live stream cards display title, channel, time, and thumbnail
- Basic HTML/CSS layout is complete
- Hover and layout effects for stream cards implemented
- Filtering interface (group/gen) is in progress

## 🤖 Human-AI Collaboration

This project was co-developed with the help of ChatGPT. ChatGPT's role included:

- Teaching step-by-step frontend concepts (HTML/CSS/JS)
- Assisting in planning architecture and refactoring
- Debugging fetch behavior and content logic
- Providing explanations and mental models

The user is a beginner developer who wants to build this project both as a usable tool and as a personal learning journey.

## 🧩 Next Steps

- Finalize UI for group/gen filter buttons
- Refactor and modularize filtering logic for better readability
- Begin Twitter/X integration as a second data stream
- (Optional) Add support for retired VTubers, or advanced filtering by date/time

This file serves as a primer for Copilot to understand the project's context, intentions, and evolution.
