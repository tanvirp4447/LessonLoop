LessonLoop

A fast, intuitive web application focused on lesson planning, curriculum alignment, differentiation, and export-ready teaching documents.

Overview

LessonLoop is a modern web application designed for early-career teachers who need a faster, more organized way to build lesson plans and manage classroom preparation materials. It provides a clean, responsive interface that helps users move from a rough lesson idea to a polished, classroom-ready plan in one place.

The application is built to simplify the lesson-planning process by reducing the need to switch between scattered notes, curriculum documents, templates, and other planning tools. Instead, LessonLoop brings these tasks into a single workspace where teachers can create structured lessons, align plans to curriculum outcomes, adapt activities for diverse learners, and export professional teaching documents.

The first version of the platform is focused on a practical and stable core experience. It is intended to feel simple, efficient, and trustworthy for teachers who want a planning tool that saves time without requiring advanced technical knowledge.

Features

- Structured lesson builder with guided planning sections
- Curriculum alignment support for outcomes or standards
- Built-in differentiation planning for supports, accommodations, and extensions
- Reusable templates for faster and more consistent lesson creation
- Clean, export-ready lesson formatting for PDF or DOCX
- Dashboard for viewing, searching, duplicating, archiving, or deleting lessons
- Responsive design optimized for laptop and tablet use
- Autosave and organized lesson storage for ongoing planning workflows

Current MVP Scope

- Teacher dashboard with saved lessons and templates
- Lesson editor with required planning sections
- Curriculum tagging or manual outcome entry
- Differentiation and assessment planning tools
- Lesson preview screen with formatted layout
- Export options for PDF and DOCX
- User authentication and account-based lesson storage

The application does not aim to include advanced integrations or overly complex planning workflows in its first release. The priority is a usable, dependable lesson-planning experience that covers the most important teacher needs.

How It Works

- The user creates an account or logs in securely.
- The user lands on a dashboard displaying saved lessons, templates, and the option to create a new lesson.
- The user chooses to begin from a blank lesson or a reusable template.
- The lesson editor guides the user through key planning sections such as objectives, materials, lesson sequence, assessment, curriculum alignment, and differentiation.
- The lesson autosaves while the user works.
- The user previews the completed lesson in a clean formatted layout.
- The user exports the lesson as a PDF or DOCX for practicum, sharing, or classroom use.
- The user can later return to revise, duplicate, archive, or delete previous lesson plans.

Tech Stack

- Frontend: React, Vite
- Styling: CSS / Tailwind
- State: React Hooks (useState, useContext)
- Build Tool: Vite

Project Structure
/src/
  components/
  pages/
  assets/
  App.jsx
  main.jsx

/public/
  index.html

package.json
vite.config.js
Setup Instructions
Prerequisites

Node.js 18+
npm

Installation
git clone https://github.com/your-username/lessonloop.git
cd lessonloop
npm install
Run Development Server
npm run dev

App runs at: http://localhost:5173

Build for Production
npm run build

Output is generated in: dist/

Preview Production Build
npm run preview
Deployment

This project is designed for static deployment.

Build command: npm run build
Output directory: dist

Design Decisions

LessonLoop was simplified into a frontend-focused application to prioritize speed, simplicity, and usability for teachers.

Backend complexity minimized for faster performance
Lesson planning handled through local state
Focus on usability, clarity, and workflow efficiency
Static deployment chosen for portability and ease of access

Future Improvements

- Persistent lesson storage using localStorage or backend
- User authentication and account system
- Curriculum database integration
- AI-assisted lesson generation features
- Improved UI polish and animations
- Dark mode support

License

This project is licensed under the MIT License.

Authors

Tanvir Parmar, Sree Jayakumar, Iman Gebara, Carson Ell, & Aleksandra Dobrzelecka

Open Source

This repository is released under the MIT License.
