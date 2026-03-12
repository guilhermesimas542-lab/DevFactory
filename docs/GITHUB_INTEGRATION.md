# GitHub Integration Guide

DevFactory can automatically sync stories and track progress directly from your GitHub repository using webhooks.

## How It Works

When you connect your GitHub repository to DevFactory:

1. **Webhook Registration**: DevFactory automatically registers a webhook on your GitHub repository
2. **Push Detection**: When you push code with story references in commit messages, GitHub notifies DevFactory
3. **Story Updates**: DevFactory automatically updates story statuses based on commit messages
4. **Real-time Sync**: No manual sync needed - everything happens automatically

## Setup Instructions

### Step 1: Generate GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Give it a name (e.g., "DevFactory Webhook")
4. Select scopes:
   - `repo` (full control of private repositories) - for analyzing code
   - `admin:repo_hook` (access to webhooks) - for registering/removing webhooks
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### Step 2: Connect Repository in DevFactory

1. Open your DevFactory project
2. Scroll to the GitHub Integration section
3. Enter:
   - **Repository URL**: `https://github.com/your-username/your-repo`
   - **Personal Access Token**: Paste the token you generated
4. Click "Connect with GitHub"
5. You should see: "✅ GitHub Connected"

### Step 3: Update Story References in Commits

When you commit code, reference stories in your commit messages:

```bash
# Start work on a story
git commit -m "feat: story-001 - implement user login"

# Mark story as in progress
git commit -m "feat: story-002 - add database schema"

# Complete a story
git commit -m "done: story-003 - write documentation"

# Fix a completed story
git commit -m "fix: story-001 - fix login bug"
```

### Commit Message Patterns

DevFactory recognizes these patterns:

| Pattern | Updates Story To | Example |
|---------|------------------|---------|
| `feat: story-*` | `in_progress` | `feat: story-001 add auth` |
| `feat: story` | `in_progress` | `feat: story implement feature` |
| `done: story-*` | `completed` | `done: story-001` |
| `done: story` | `completed` | `done: story complete feature` |
| `fix: story-*` | `completed` | `fix: story-001 fix bug` |
| `fix: story` | `completed` | `fix: story bugfix` |

## How Webhook Matching Works

### By Story ID (Preferred)

If you reference a story ID in the commit message, DevFactory tries to match it directly:

```bash
git commit -m "feat: story-001 - add login form"
```

DevFactory will look for a story with ID `001` or that ends with `001`.

### By Story Title (Fallback)

If the story ID doesn't match, DevFactory tries to match by story title:

```bash
git commit -m "feat: add login form"
```

If you have a story titled "Add Login Form", it will be updated.

## Configuration

### Environment Variables (Backend)

```env
# Public URL of the DevFactory API (needed for webhook registration)
# Local development: http://localhost:5000
# Production: https://devfactory-api.up.railway.app (or your Railway URL)
API_PUBLIC_URL=http://localhost:5000

# Optional: Global GitHub token (fallback if project doesn't have one)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### Railway/Production Setup

After deploying to Railway:

1. Set environment variable `API_PUBLIC_URL` to your Railway API URL:
   - Go to Railway → Your Project → Variables
   - Add: `API_PUBLIC_URL=https://devfactory-api.up.railway.app`
   - (Replace with your actual Railway API domain)

2. Redeploy the API

## Security

- **Token Storage**: Tokens are base64 encoded in the database (sufficient for MVP)
- **Webhook Verification**: All webhooks are verified using HMAC-SHA256 signature
- **No Public Data**: Only DevFactory can process webhooks (signature verification required)

## Troubleshooting

### "Invalid GitHub token or insufficient permissions"

- Check that the token is correct and hasn't expired
- Verify the token has `repo` and `admin:repo_hook` scopes
- Try regenerating a new token

### "Webhook already exists for this repository"

- The repository already has a webhook registered
- Use "Disconnect" button first, then reconnect
- Or manually remove the webhook from GitHub settings

### Stories not updating after push

1. Check that commit message follows the correct pattern (see table above)
2. Go to GitHub → Settings → Webhooks to verify webhook is active
3. Check the Recent Deliveries tab to see if GitHub is sending the events
4. Check DevFactory backend logs for any errors

### "API_PUBLIC_URL not configured"

- The backend doesn't know its public URL for the webhook
- Configure `API_PUBLIC_URL` environment variable
- For Railway: set in project Variables
- For local dev: set in `.env` file

## Manual Sync

If webhooks aren't working or you need an immediate sync:

1. Click "Sync Now" button in GitHub Integration section
2. DevFactory will fetch recent commits and update stories

## Disconnect Repository

To disconnect GitHub:

1. Click "Disconnect" button in GitHub Integration section
2. DevFactory will remove the webhook from GitHub
3. Credentials are cleared from the database
4. You can reconnect anytime with a new token

## Advanced: Webhook Testing

Test your webhook configuration:

```bash
curl -X POST http://localhost:5000/api/webhooks/github \
  -H "X-Hub-Signature-256: sha256=dummy" \
  -H "X-GitHub-Event: push" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": {
      "html_url": "https://github.com/owner/repo"
    },
    "commits": [{
      "id": "abcd1234",
      "message": "feat: story-001"
    }]
  }'
```

Note: This will fail signature verification (as expected). Use GitHub's webhook testing tool in Settings → Webhooks → Recent Deliveries instead.

## What's Tracked

DevFactory tracks:

- ✅ Commit message patterns (feat, fix, done)
- ✅ Story ID references
- ✅ Story title matches
- ✅ Last sync time
- ✅ Stories updated via webhook

DevFactory does NOT track:

- ❌ Pull requests (yet)
- ❌ Issues (yet)
- ❌ Code changes in detail
- ❌ Author information

Future versions may add these features.
