# Technical Requirements — mattodos

These are additional technical constraints and deliverable requirements for the mattodos project, sourced from the course assignment specification. They supplement the PRD with concrete infrastructure, testing, and documentation mandates.

## Testing Strategy

Testing is integrated from day one — not bolted on at the end.

### Test Infrastructure

- **Unit/Integration Tests:** Jest or Vitest
- **E2E Tests:** Playwright
- **Test commands** configured in `package.json`

### Test Requirements

| Type | Approach |
|---|---|
| Backend integration tests | Written alongside each API endpoint |
| Frontend component tests | Written alongside each component |
| E2E tests | Cover all user journeys from stories |

### E2E Coverage (Minimum)

- Create a todo
- Complete a todo
- Delete a todo
- Empty state handling
- Error state handling
- Minimum **5 passing Playwright tests**

### Coverage Target

- Minimum **70% meaningful code coverage** (not vanity metrics — actual logic coverage)

## Containerization

The application must run via Docker Compose.

### Dockerfiles

- Multi-stage builds for frontend and backend
- Non-root users in containers
- Health check instructions included

### Docker Compose

- Orchestrates all containers (app, database if needed)
- Proper networking and volume mounts
- Environment variable configuration
- Support for dev/test environments via compose profiles

### Health Checks

- Health check endpoints implemented in the backend
- Containers report health status
- Logs accessible via `docker-compose logs`

### Deployment

- Application runs successfully with `docker-compose up`

## Quality Assurance

### Performance

- Analyze application performance and document findings

### Accessibility

- Automated accessibility audits (Lighthouse or axe-core via Playwright)
- WCAG AA compliance — zero critical violations

### Security

- Code reviewed for common vulnerabilities (XSS, injection)
- Findings documented with remediations

## Deliverables

- BMAD artifacts (project brief, architecture docs, stories with acceptance criteria)
- Working todo application (frontend + backend)
- Unit, integration, and E2E test suites
- Dockerfiles and `docker-compose.yml`
- QA reports (coverage, accessibility, security review)
- README with setup instructions
- AI integration log documenting agent usage, limitations, and learnings

## Success Criteria

| Criterion | Target |
|---|---|
| Working application | All CRUD operations functional |
| Test coverage | ≥ 70% meaningful coverage |
| E2E tests | ≥ 5 passing Playwright tests |
| Docker deployment | Runs via `docker-compose up` |
| Accessibility | Zero critical WCAG violations |
| Documentation | README + AI integration log |