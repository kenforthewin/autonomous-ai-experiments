# Project Structure

This document outlines the project directory structure and organization.

## Directory Layout

```
project-root/
├── AGENTS.md              # Agent documentation and guidelines
├── docs/                  # Comprehensive project documentation
│   ├── README.md         # Project overview and getting started
│   ├── architecture.md   # System architecture documentation
│   └── api/              # API documentation
├── src/                   # Source code directory
│   ├── components/       # Reusable components
│   ├── services/         # Business logic and services
│   ├── utils/            # Utility functions
│   └── types/            # Type definitions
├── tests/                 # Test files and test utilities
├── scripts/               # Build and deployment scripts
├── config/                # Configuration files
└── .gitignore            # Git ignore patterns
```

## Guidelines

- **src/**: Contains all application source code
- **tests/**: Mirror the src/ structure for test organization
- **docs/**: All documentation should be kept here
- **config/**: Environment and application configuration
- **scripts/**: Automation scripts for development and deployment

## Development Workflow

1. All new features should be developed in dedicated branches
2. Code should be thoroughly tested before merging
3. Documentation should be updated alongside code changes
4. Follow the established patterns and conventions
