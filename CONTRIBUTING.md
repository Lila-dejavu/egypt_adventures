# Contributing to Egypt Adventures

Thank you for your interest in contributing to Egypt Adventures! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment. Be kind, constructive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/egypt_adventures.git
   cd egypt_adventures
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in [Issues](https://github.com/Lila-dejavu/egypt_adventures/issues)
- If not, create a new issue with:
  - A clear, descriptive title
  - Steps to reproduce the bug
  - Expected behavior vs. actual behavior
  - Screenshots or error messages (if applicable)
  - Browser and OS information

### Suggesting Features
- Check if the feature has already been suggested
- Create a new issue describing:
  - The problem your feature would solve
  - How the feature would work
  - Any alternatives you've considered

### Code Contributions
1. Ensure your code follows the project's coding standards
2. Test your changes thoroughly
3. Update documentation as needed
4. Add or update tests if applicable

## Coding Standards

### JavaScript
- Use modern ES6+ syntax
- Follow consistent naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants
- Add comments for complex logic
- Keep functions focused and single-purpose

### HTML/CSS
- Use semantic HTML elements
- Maintain consistent indentation (2 spaces)
- Keep styles organized and modular
- Use class names that describe purpose, not appearance

### File Organization
- Place game logic in appropriate modules under `js/`
- Keep related functionality together
- Use the existing file structure as a guide:
  - `js/core/`: Core game logic and utilities
  - `js/combat/`: Combat-related mechanics
  - `js/ui/`: User interface management
  - `js/mixins/`: Reusable game logic components

### Localization
- Use the `i18n.js` system for all user-facing text
- Add translations for all supported languages
- Never hardcode text strings in the UI

## Commit Guidelines

Write clear, descriptive commit messages:

```
type(scope): brief description

Longer explanation if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(combat): add new slot machine mechanic
fix(ui): correct health bar display issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update your branch** with the latest changes from main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test your changes** thoroughly:
   - Open `index.html` in multiple browsers
   - Test the specific functionality you changed
   - Ensure no existing features are broken

3. **Commit your changes** with clear commit messages

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub with:
   - A clear title describing the change
   - A detailed description of what changed and why
   - References to related issues (e.g., "Fixes #123")
   - Screenshots or GIFs for UI changes

6. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes in new commits
   - Update the PR description if the scope changes

7. **Merge requirements**:
   - All discussions must be resolved
   - Code must follow project standards
   - Tests must pass (if applicable)
   - At least one approval from a maintainer

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Contact the maintainer: [Lila-dejavu](https://github.com/Lila-dejavu)

Thank you for contributing to Egypt Adventures!
