# CI/CD Security Gates Documentation

This directory contains GitHub Actions workflows that enforce security best practices for the Rural Water Supply MIS application.

## Security Scan Workflow (`security-scan.yml`)

### Overview

The security scan workflow runs comprehensive security checks on every push, pull request, and weekly via cron. It includes:

1. **SAST (Static Application Security Testing)**
2. **Dependency Vulnerability Scanning**
3. **Secrets Detection**
4. **Security Test Suite Execution**
5. **License Compliance Checking**
6. **Docker Image Security Scanning**

### Workflow Triggers

- **Push**: Runs on pushes to `main` and `develop` branches
- **Pull Request**: Runs on PRs targeting `main` and `develop`
- **Schedule**: Runs weekly (Sundays at midnight UTC)

### Jobs

#### 1. SAST - Backend (Laravel/PHP)

**Purpose**: Detect security vulnerabilities and code quality issues in PHP/Laravel code

**Tools Used**:
- **PHPStan**: Static analysis tool for PHP
  - Memory limit: 2GB
  - Error format: GitHub annotations
- **Laravel Pint**: Code quality and style checker
- **Composer Audit**: Checks for known vulnerabilities in Composer packages

**Configuration**:
```yaml
php-version: '8.2'
extensions: mbstring, xml, ctype, json, pgsql
```

**Exit Criteria**:
- PHPStan must pass (no errors allowed) - **BLOCKING**
- Laravel Pint must pass (code quality enforced) - **BLOCKING**
- Composer audit must pass (no vulnerabilities) - **BLOCKING**

#### 2. SAST - Frontend (React/TypeScript)

**Purpose**: Detect security issues in React/TypeScript frontend code

**Tools Used**:
- **ESLint**: JavaScript/TypeScript linter with security rules
- **TypeScript Compiler**: Type-checking for type safety
- **npm audit**: Dependency vulnerability scanning

**Configuration**:
```yaml
node-version: '20'
cache: npm
```

**Exit Criteria**:
- TypeScript must compile without errors - **BLOCKING**
- ESLint must pass (security and quality rules enforced) - **BLOCKING**
- npm audit must pass (no moderate+ vulnerabilities) - **BLOCKING**

#### 3. Dependency Vulnerability Scan

**Purpose**: Identify known vulnerabilities in project dependencies

**Scans**:
- **Backend**: `composer audit` for PHP packages
- **Frontend**: `npm audit` for Node.js packages
- **Outdated Check**: Flags outdated direct dependencies

**Audit Levels**:
- PHP: All severity levels - **BLOCKING**
- npm: Moderate and above - **BLOCKING**

**Output**: Table format for easy review

**Exit Criteria**:
- Composer audit must pass (no known vulnerabilities) - **BLOCKING**
- npm audit must pass (no moderate+ vulnerabilities) - **BLOCKING**
- Outdated package check is informational only (non-blocking)

#### 4. Secrets Scanning

**Purpose**: Prevent accidental commit of sensitive credentials

**Tools Used**:

1. **TruffleHog OSS**
   - Scans git history for secrets
   - Verifies detected secrets
   - Detects high-entropy strings
   
2. **Gitleaks**
   - Pattern-based secret detection
   - Custom rules for API keys, tokens, passwords
   - SARIF output for GitHub Security

**Detected Secret Types**:
- API keys (AWS, OpenAI, Stripe, etc.)
- Private keys (RSA, SSH, etc.)
- Authentication tokens
- Database credentials
- High-entropy strings

**Configuration**: Uses default rulesets

**Exit Criteria**:
- No secrets detected - **BLOCKING**
- TruffleHog and Gitleaks must both pass
- Verified secrets will fail the workflow immediately

#### 5. Security Test Suite

**Purpose**: Run comprehensive security tests in CI environment

**Test Environment**:
- **Database**: PostGIS 16-3.4 (PostgreSQL with spatial extensions)
- **PHP**: 8.2 with required extensions
- **Laravel**: Testing environment

**Tests Executed**:
- Tenant isolation tests (RLS enforcement)
- RBAC permission tests
- Audit logging tests
- Encryption/decryption tests
- DSR workflow tests

**Test Configuration**:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=testing
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

**Exit Criteria**: 
- All 67 security tests must pass - **BLOCKING**
- Stops on first failure for fast feedback (`--stop-on-failure`)
- Tests tenant isolation, RBAC, audit logging, encryption, DSR workflows

#### 6. License Compliance

**Purpose**: Ensure dependencies use approved licenses

**Checks**:
- Generates license summary
- Fails on GPL/AGPL licenses (copyleft) - **BLOCKING**
- Whitelist: MIT, Apache-2.0, BSD, ISC

**Tools**: `license-checker` (npm package)

**Exit Criteria**:
- No GPL/AGPL licenses allowed - **BLOCKING**
- Merges will be blocked if copyleft licenses detected

#### 7. Docker Security Scan

**Purpose**: Scan filesystem and containers for vulnerabilities

**Tool**: Trivy by Aqua Security

**Scan Types**:
- Filesystem vulnerabilities
- Misconfigurations
- Secrets in code/config

**Output**: SARIF format uploaded to GitHub Security tab

**Exit Criteria**:
- Trivy scan must pass (no critical vulnerabilities) - **BLOCKING**
- Results uploaded to GitHub Security for tracking

#### 8. Summary Job

**Purpose**: Aggregate results and provide actionable summary

**Features**:
- Creates GitHub Step Summary with all job results
- Fails workflow if any security job fails
- Provides clear pass/fail indicators

## Setup Instructions

### 1. GitHub Repository Setup

Enable the following GitHub settings:

```
Settings > Code security and analysis:
- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Secret scanning
- ✅ Code scanning (CodeQL)
```

**Important**: All security checks in this workflow are **BLOCKING** by default. Any failure will prevent merging.

### 2. Required Secrets

Add these to your repository secrets (`Settings > Secrets and variables > Actions`):

```
GITLEAKS_LICENSE (optional) - Enterprise license for gitleaks
```

### 3. Branch Protection Rules

Configure branch protection for `main`:

```
Settings > Branches > Add branch protection rule:
Branch name pattern: main

Protect matching branches:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - security-scan / sast-backend (BLOCKING)
  - security-scan / sast-frontend (BLOCKING)
  - security-scan / dependency-scan (BLOCKING)
  - security-scan / secrets-scan (BLOCKING)
  - security-scan / security-tests (BLOCKING)
  - security-scan / license-compliance (BLOCKING)
  - security-scan / docker-security (BLOCKING)
- ✅ Require conversation resolution before merging
- ✅ Include administrators
```

**Note**: All 7 security jobs must pass before merging is allowed.

### 4. Local Pre-commit Hooks (Optional)

Install pre-commit hooks to catch issues before pushing:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: main
    hooks:
      - id: trufflehog
        args: ['--regex', '--entropy=True']
  
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
EOF
```

## Fixing Security Issues

### High Severity Vulnerabilities

1. **Secrets Detected**:
   ```bash
   # Rotate the exposed secret immediately
   # Update all systems using the secret
   # Use git-filter-repo to remove from history:
   git filter-repo --path-match <secret-file> --invert-paths
   ```

2. **Dependency Vulnerabilities**:
   ```bash
   # Backend (Composer)
   cd api
   composer update <package-name>
   
   # Frontend (npm)
   cd client
   npm audit fix
   # Or for breaking changes:
   npm audit fix --force
   ```

3. **SAST Findings**:
   - Review PHPStan/ESLint output
   - Fix identified security issues
   - Run locally before pushing:
     ```bash
     cd api && vendor/bin/phpstan analyse
     cd client && npm run lint
     ```

### Medium Severity Issues

1. **License Violations**:
   - Replace GPL/AGPL packages with MIT/Apache alternatives
   - Seek legal approval if GPL is necessary
   - Document exceptions in `LICENSE_EXCEPTIONS.md`

2. **Outdated Dependencies**:
   ```bash
   # Review outdated packages
   cd api && composer outdated
   cd client && npm outdated
   
   # Update carefully (test thoroughly)
   composer update
   npm update
   ```

### Best Practices

1. **Never Commit Secrets**:
   - Use `.env` files (never commit)
   - Use environment variables
   - Use secret management tools (AWS Secrets Manager, Vault)

2. **Keep Dependencies Updated**:
   - Review Dependabot alerts weekly
   - Update minor versions monthly
   - Test major updates in staging first

3. **Review Security Alerts**:
   - Check GitHub Security tab regularly
   - Address high-severity issues within 24 hours
   - Document risk acceptance for medium/low issues

4. **Run Tests Locally**:
   ```bash
   # Backend security tests
   cd api
   php artisan test --testsuite=Feature --filter Security
   
   # Frontend linting
   cd client
   npm run lint
   ```

## Monitoring and Alerts

### GitHub Security Tab

Access: `https://github.com/<org>/<repo>/security`

**Sections**:
- **Vulnerability alerts**: Dependabot findings
- **Code scanning**: SAST findings (CodeQL, Trivy)
- **Secret scanning**: Detected secrets

### Notifications

Configure notification preferences:

```
Settings > Notifications > Watching
- ✅ Security alerts
```

### Weekly Review

Schedule weekly security review:
1. Review open security alerts
2. Check dependency update PRs from Dependabot
3. Review failed security scans
4. Update security documentation

## Troubleshooting

### PHPStan Out of Memory

```yaml
# Increase memory limit in workflow
run: vendor/bin/phpstan analyse --memory-limit=4G
```

### Secrets False Positives

```yaml
# Exclude files in .gitleaksignore
**/*test*.php
**/*example*.env
```

### Test Database Connection Issues

```yaml
# Verify postgres service is healthy
- name: Wait for PostgreSQL
  run: |
    until pg_isready -h 127.0.0.1 -p 5432; do
      sleep 1
    done
```

## Future Enhancements

1. **SAST Tools**:
   - Add SonarQube for comprehensive code analysis
   - Integrate Snyk for advanced vulnerability detection

2. **Dynamic Testing**:
   - Add DAST (Dynamic Application Security Testing)
   - Implement penetration testing automation

3. **Compliance**:
   - Add GDPR compliance checks
   - Implement SOC 2 audit automation

4. **Performance**:
   - Cache Composer/npm dependencies
   - Parallelize independent jobs further

## Resources

- [PHPStan Documentation](https://phpstan.org/user-guide/getting-started)
- [TruffleHog GitHub Action](https://github.com/trufflesecurity/trufflehog)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
