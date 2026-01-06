# Contributing to Toddy Milk Delivery

Thank you for considering contributing to our project! This document provides guidelines for contributing.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/toddy-milk-delivery.git
   cd toddy-milk-delivery
   ```

2. **Environment Setup**
   ```bash
   cp src/config/.env.example src/config/.env
   # Edit .env with your configuration
   ```

3. **Local Development**
   ```bash
   npm run dev
   # Or use any static file server
   ```

## Code Standards

### File Structure
- HTML files: `src/pages/`
- JavaScript: `src/scripts/`
- CSS: `src/styles/`
- Assets: `src/assets/`
- Config: `src/config/`

### Naming Conventions
- Files: `kebab-case.html`, `camelCase.js`
- Functions: `camelCase`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Code Style
- Use semicolons
- 2-space indentation
- Single quotes for strings
- Meaningful variable names
- Comment complex logic

## Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(payment): add UPI payment integration
fix(location): correct distance calculation
docs(readme): update setup instructions
```

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

## Testing

- Test all user flows
- Verify mobile responsiveness
- Check payment integration
- Validate form inputs
- Test error scenarios

## Security

- Never commit sensitive data
- Use environment variables
- Validate all inputs
- Follow security best practices
- Report security issues privately