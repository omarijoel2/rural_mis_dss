# Native Deployment Guide - iOS & Android

This guide covers building and deploying the Rural Water MIS mobile app to iOS (Apple App Store) and Android (Google Play Store).

## Prerequisites

### Local Setup
```bash
# Install Node.js 18+
node --version

# Install Expo CLI globally
npm install -g eas-cli expo-cli

# Navigate to mobile directory
cd mobile

# Install dependencies
npm install
```

### Environment Setup
Create a `.env.local` file in the mobile directory:
```
EXPO_PUBLIC_API_URL=https://api.ruralwater.example.com
EXPO_PUBLIC_TENANT_ID=your-default-tenant-id
```

## Build Configuration

The `eas.json` file in the mobile directory defines three build profiles:

### 1. Development Build (For Testing)
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

**Use for:**
- Testing on physical devices before submission
- Development and QA testing
- Debugging with Expo dev client

### 2. Preview Build (For UAT)
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

**Use for:**
- User acceptance testing (UAT)
- Beta testing with external testers
- Internal staging verification

**Distribution:**
- iOS: Via Ad Hoc provisioning (TestFlight alternative)
- Android: As APK for manual testing

### 3. Production Build (For App Stores)
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

**Use for:**
- Final release to App Store and Play Store
- Production deployment
- Public availability

## iOS Deployment

### Prerequisites
1. **Apple Developer Account** ($99/year)
2. **Create App ID** in Apple Developer Console
3. **Generate Certificates**:
   ```bash
   eas credentials
   ```

### Build & Submit to App Store
```bash
# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

**App Store Review Guidelines:**
- Minimum iOS version: 13.0+
- Must support iPhone and iPad
- Privacy policy required
- GDPR/data protection compliance needed

### Build Time
- First build: ~20 minutes
- Subsequent builds: ~10-15 minutes

## Android Deployment

### Prerequisites
1. **Google Play Developer Account** ($25 one-time)
2. **Google Play Service Account JSON Key**
3. **Generate Signing Key**:
   ```bash
   eas credentials
   ```

### Build & Submit to Play Store
```bash
# Create production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

**Play Store Requirements:**
- Minimum API level: 24 (Android 7.0+)
- Target API level: 34+ (current standard)
- Privacy policy URL
- Screenshot and description
- Category and content rating

### Build Time
- First build: ~15 minutes
- Subsequent builds: ~10 minutes

## Build Automation (CI/CD)

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Mobile App

on:
  push:
    branches:
      - main
      - staging

jobs:
  build-and-submit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd mobile && npm install
      
      - name: Build iOS
        run: |
          npx eas build --platform ios \
            --profile ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} \
            --non-interactive \
            --wait
      
      - name: Build Android
        run: |
          npx eas build --platform android \
            --profile ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} \
            --non-interactive \
            --wait
      
      - name: Submit to stores
        if: github.ref == 'refs/heads/main'
        run: |
          npx eas submit --platform ios --latest --non-interactive
          npx eas submit --platform android --latest --non-interactive
```

## Managing Secrets & Credentials

### Secure Storage with EAS
```bash
# Set environment variables for builds
eas secret:create --scope project --name API_URL --value "https://api.ruralwater.example.com"
eas secret:create --scope project --name TENANT_ID --value "your-tenant-id"
```

### Access in app.json
```json
{
  "build": {
    "env": {
      "API_URL": "@env API_URL",
      "TENANT_ID": "@env TENANT_ID"
    }
  }
}
```

## Version Management

### Update Version for Release
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

Edit `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildNumber": 2
      }
    }
  }
}
```

## Testing Builds

### Test Production Build Locally
```bash
# Build production APK for Android testing
eas build --platform android --profile production --wait

# Install on device
eas build:download --platform android --id <build-id>
adb install app.apk
```

## Troubleshooting

### Build Fails
```bash
# Clear build cache
eas build:cache --platform ios --delete
eas build:cache --platform android --delete

# Rebuild with verbose logging
eas build --platform ios --profile production --verbose
```

### App Crashes on Launch
- Check device logs: `npx expo-cli logs`
- Verify API endpoints in environment variables
- Check permissions in `app.json`
- Review `AsyncStorage` initialization

### Store Submission Rejected
- **iOS**: Review Apple's App Store Review Guidelines
- **Android**: Check Google Play's policies
- Common issues: Privacy policy missing, biometric usage not disclosed
- Ensure encryption compliance (HIPAA/GDPR if needed)

## Version Management & Updates

### Over-the-Air Updates (Future)
```bash
# When implementing EAS Updates:
eas update --branch production
```

### Rollback
```bash
eas update --branch production --rollback-to-latest
```

## Security Checklist

- [ ] All API endpoints use HTTPS
- [ ] Sensitive data encrypted in local storage
- [ ] Biometric authentication enabled
- [ ] No hardcoded credentials in code
- [ ] Environment variables properly configured
- [ ] Privacy policy up-to-date
- [ ] GDPR/compliance review completed
- [ ] App permissions justified

## Release Checklist

- [ ] Update version number in `app.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test on iOS and Android devices
- [ ] Security review completed
- [ ] Privacy policy reviewed
- [ ] Screenshots prepared (3-5 per store)
- [ ] Description and release notes updated
- [ ] All CI/CD checks passing
- [ ] Team approval received

## Rollout Strategy

### Phase 1: Internal Testing
1. Build development version
2. Distribute to team via TestFlight (iOS) or internal testing (Android)
3. Collect feedback

### Phase 2: Beta Testing
1. Build preview version
2. Recruit 50-100 external beta testers
3. Monitor crash rates and feedback
4. Iterate on bugs

### Phase 3: Production Release
1. Build production version
2. Submit to both stores
3. Monitor store reviews and ratings
4. Be prepared for quick patches if needed

## Performance Metrics to Monitor

After release, track:
- **Crash Rate**: Target < 0.1%
- **Startup Time**: Target < 3 seconds
- **Memory Usage**: Target < 150MB
- **Battery Impact**: Monitor after release
- **User Retention**: Track after 7, 30 days
- **Store Ratings**: Monitor for feedback

## Support & Maintenance

### Version Support Plan
- **Current**: Latest version only - full support
- **Previous**: Security updates only for 6 months
- **Older**: No support, users encouraged to update

### Update Frequency
- **Bug Fixes**: As needed (1-2 day turnaround)
- **Features**: Monthly releases
- **Major Updates**: Quarterly reviews

## Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

**Last Updated**: November 22, 2025  
**Mobile App Version**: 1.0.0  
**Support**: contact@ruralwater.example.com
