# How to Update the Workflow to Run Both Servers

## Quick Instructions

Follow these steps to make both Express and Laravel servers start automatically:

### Step 1: Open Workflow Configuration

1. Look at the top of your Replit workspace
2. Find the **"Run"** button (green play button)
3. Click the **three dots** (⋮) next to it
4. Select **"Configure workflows"** or **"Edit workflows"**

### Step 2: Edit the "Start Game" Workflow

1. Find the workflow named **"Start Game"**
2. Click on it to edit
3. Look for the **"Execute Shell Command"** task
4. You'll see this command:
   ```
   npm run dev
   ```

### Step 3: Update the Command

Replace the command with:
```bash
./start-dev.sh
```

### Step 4: Save and Run

1. Click **"Save"** or **"Done"**
2. Click the **"Run"** button
3. You should now see BOTH servers starting:
   - **Express** (blue text) on port 5000
   - **Laravel** (orange text) on port 8001

## Visual Guide

```
Workflow Editor
┌─────────────────────────────────────┐
│ Workflow: Start Game                │
├─────────────────────────────────────┤
│                                     │
│ Task 1: Execute Shell Command      │
│ ┌─────────────────────────────────┐ │
│ │ Command: ./start-dev.sh         │ │  ← Change this line
│ └─────────────────────────────────┘ │
│                                     │
│ Wait for port: 5000                │  ← Keep this
│                                     │
└─────────────────────────────────────┘
```

## What You Should See

After updating and running, your terminal should show:

```
[Express] 6:10:23 AM [express] serving on port 5000
[Laravel] Laravel development server started: http://127.0.0.1:8001
```

## Verify It's Working

1. **Check Express** - Open your app, you should see the Rural Water MIS interface
2. **Check Laravel** - Navigate to Core Registry > Schemes
   - ✅ If data loads: Both servers working!
   - ❌ If "Failed to fetch": Laravel didn't start, check the terminal

## Troubleshooting

### Can't find workflow editor?

Alternative method - create a new workflow:

1. Click "Run" button dropdown
2. Select "Create new workflow"
3. Name it: **"Rural Water MIS"**
4. Add task: **Execute Shell Command**
5. Command: `./start-dev.sh`
6. Wait for port: `5000`
7. Save and set as default

### Script permission denied?

Run in Shell:
```bash
chmod +x start-dev.sh
```

### Both servers won't start?

Check if ports are already in use:
```bash
lsof -ti:5000 | xargs kill -9  # Kill Express
lsof -ti:8001 | xargs kill -9  # Kill Laravel
```

Then restart the workflow.
