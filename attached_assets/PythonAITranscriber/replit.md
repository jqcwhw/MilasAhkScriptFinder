# Overview

This is a Python to AutoHotkey code converter and game automation helper application built with Streamlit. The application uses Claude AI (Anthropic) to:
1. Intelligently translate Python code into AutoHotkey (AHK) scripts
2. Generate custom game automation scripts
3. Validate and debug converted code
All scripts are stored in a PostgreSQL database for persistence across sessions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Streamlit web framework
- **UI Components**: Wide layout configuration for better code visibility
- **State Management**: Streamlit session state for persisting:
  - Converted code output
  - Validation results
  - Input Python code
  - Conversion history across user sessions

## Code Processing
- **Syntax Highlighting**: Pygments library for rendering Python and AutoHotkey code with proper syntax coloring
  - PythonLexer for input code
  - AutohotkeyLexer for output code
  - HtmlFormatter for web display
- **Conversion Logic**: AI-powered translation from Python to AutoHotkey using natural language prompting

## AI Integration
- **Provider**: Anthropic Claude AI (claude-sonnet-4-5 model)
- **Integration Method**: Replit AI Integrations for secure API key management
- **Conversion Strategy**: Prompt-based code translation with instructions for:
  - Accurate syntax conversion
  - AutoHotkey best practices
  - Inline comments for complex translations
  - Clean output without markdown formatting

# External Dependencies

## Third-party Services
- **Anthropic API**: Claude AI service for code conversion
  - Accessed via Replit AI Integrations
  - Base URL and API key configured through environment variables
  - Model: claude-sonnet-4-5

## Python Libraries
- **streamlit**: Web application framework
- **anthropic**: Official Anthropic API client
- **pygments**: Syntax highlighting engine for multiple programming languages
- **sqlalchemy**: ORM for database operations
- **psycopg2-binary**: PostgreSQL database adapter

## Database Schema
- **SavedScript Model**: Stores all user scripts with the following fields:
  - id (Primary Key)
  - name (Script name)
  - description (Optional description)
  - python_code (Original Python code for conversions)
  - ahk_code (Generated/converted AutoHotkey code)
  - script_type (Type: 'conversion' or 'game_helper')
  - created_at (Timestamp)
  - updated_at (Timestamp)

## Features
1. **Python to AutoHotkey Conversion**: Convert Python code to AutoHotkey with AI assistance
2. **AI Validation**: Verify converted code accuracy and identify potential issues
3. **Interactive Debugging**: Get AI-powered fixes and explanations for problems
4. **Persistent Storage**: Save and load scripts from PostgreSQL database
5. **Game Helper**: Generate game automation scripts (auto-clickers, bots, macros)
6. **Script Templates**: Pre-built templates for common automation tasks
7. **Download & Export**: Export scripts as .ahk files

## Environment Variables
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY`: Authentication key for Anthropic API
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`: Base URL endpoint for API requests
- `DATABASE_URL`: PostgreSQL database connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Database connection parameters