# Feature Ideas and To-Dos

A working backlog for future smart-home-lab features. Unchecked items describe
planned work, not existing functionality. Behaviors marked **Proposed** are draft
defaults; **Open decisions** capture details to settle before implementation.

## Camera, Motion Sensor, and Security Modes

Coordinate motion detection, camera snapshots, and alarms through a shared
security state so that devices respond consistently.

- [ ] Add security states: disarmed, arming (exit countdown), armed home, armed
  away, entry countdown, and alarm triggered.
- [ ] Define which sensors are active in each mode. **Proposed:** home mode arms
  perimeter sensors while allowing indoor movement; away mode also arms indoor
  motion sensors.
- [ ] Show the current mode and remaining entry or exit countdown in the dashboard.
- [ ] Allow authorized users to arm the system and disarm it with a valid code.
- [ ] Send a push notification when an active motion sensor detects movement.
  Include the device, location, detection time, and a link to the event if available.
- [ ] Capture a camera snapshot when motion is detected and associate it with the
  same event. Record capture failures without blocking the motion notification.
- [ ] Add a configurable cooldown to avoid repeated notifications and snapshots
  from one continuous movement event.
- [ ] Restrict snapshot access and configure how long images are retained.
- [ ] Define what happens when sensors go offline or the service restarts during
  a countdown or alarm.
- [ ] Add simulated motion and camera events for development without hardware.

**Open decisions:** Does “home/away lock” mean security modes only, or should it
also control a physical smart lock? Which sensors start an entry countdown, and
which trigger an immediate alarm? Should disarmed mode still record motion or
capture snapshots? What should the exit delay be?

## Door Sensor and Unlock Notifications

Track door activity and notify the user when the door is unlocked or opened.
Door open/closed state and lock locked/unlocked state are separate: unlock
notifications require a lock integration that reports lock state.

- [ ] Track door open/closed state and, when available, lock locked/unlocked state.
- [ ] Notify the user when the lock changes to unlocked; include the door and time.
- [ ] Offer separate notifications for door opening and for a door left open beyond
  a configurable duration.
- [ ] Use relevant door events to start the security system's entry countdown.
- [ ] Ignore duplicate state reports so reconnects do not produce repeated alerts.
- [ ] Add simulated door and lock events.

**Open decisions:** Which door and lock hardware will be used? Should routine
unlock notifications always be sent, or only while the system is armed away?

## Buzzer and Disarm Countdown

Sound the buzzer if the user does not enter the correct disarm code within
15 seconds of the entry countdown starting.

**Proposed:** Opening a designated entry door while armed starts the countdown.
A correct code disarms the system and cancels the countdown. Incorrect attempts
do not restart or extend the timer; expiry triggers the buzzer and an alarm event.

- [ ] Implement the 15-second entry timer in the backend or Home Assistant so it
  continues even if the browser disconnects.
- [ ] Display the remaining time and clear feedback for incorrect code attempts.
- [ ] Activate the buzzer at expiry and send an alarm notification.
- [ ] Allow a valid disarm action to stop an active buzzer.
- [ ] Store disarm credentials securely, limit repeated guesses, and exclude codes
  from logs and console history.
- [ ] Define a maximum buzzer duration and behavior after a service restart.
- [ ] Verify correct-code, incorrect-code, timeout, and disconnect scenarios using
  a simulated buzzer.

**Open decisions:** Confirm the countdown trigger and whether 15 seconds should
be configurable. Decide whether motion can also start the countdown.

## Web Console

Add a browser console for remote device management, then optionally extend it
with a full shell terminal. Keep application commands and shell sessions distinct.

### Phase 1: Application Command Console

- [ ] Build a console interface with command input, output, and command history.
- [ ] Add `help`, device listing, device status, and device control commands.
- [ ] Add a small allowlist of configuration commands with argument validation and
  clear errors; decide which settings are safe to change interactively.
- [ ] Route commands through an authenticated backend and enforce permissions
  there. Application commands should call explicit handlers without invoking a shell.
- [ ] Report pending, successful, failed, and timed-out device commands accurately.
- [ ] Record command outcomes in the event log without storing credentials.

### Session Handling and Remote Access

- [ ] Associate each session with an authenticated user and enforce session ownership.
- [ ] Define idle expiry, logout cleanup, concurrent-session limits, and behavior
  when the browser disconnects or reconnects.
- [ ] Decide whether remote access is limited to the local network, provided through
  a VPN, or exposed through an authenticated HTTPS endpoint.
- [ ] Show connection status and avoid replaying device commands automatically
  after a reconnect.

### Phase 2: Full Shell Terminal

- [ ] Evaluate `node-pty` for backend terminal sessions and a browser terminal
  component for input/output and resizing.
- [ ] Decide which environment the shell controls: a dedicated container, the
  backend container, or another explicitly selected machine.
- [ ] Restrict shell access to authorized administrators and run sessions with
  limited privileges and filesystem access.
- [ ] Define resource limits and terminate terminal processes when sessions expire.
- [ ] Define whether disconnected sessions survive briefly and how users reconnect
  to their own sessions.
- [ ] Audit session starts and stops; decide whether terminal output should be
  retained, given that it may contain sensitive information.

### Proposed Project Structure

The `backend/` directory and console component below are planned additions.
Existing frontend components and other project files are omitted for brevity.

```text
smart-home-lab/
├── FEATURES.md
├── frontend/
│   └── src/components/console/Console.tsx
├── backend/
│   └── src/
│       ├── server.ts
│       └── console/
├── simulator/
├── home-assistant/
├── mosquitto/
└── docker-compose.yml
```

**Open decisions:** Which behaviors belong in Home Assistant versus the new
backend? Choose one owner for security state and countdowns. Decide when to add
the backend service to Docker Compose.

## Event Logs

Provide a searchable timeline for understanding device activity and investigating
unexpected behavior.

- [ ] Define a shared event format with an ID, timestamp, event type, source device,
  severity, outcome, and related event or snapshot references.
- [ ] Record security mode changes, motion, door and lock changes, alarm activity,
  notification delivery outcomes, device availability, and console actions.
- [ ] Distinguish a notification being queued or sent from confirmed delivery.
- [ ] Add filters for date range, device, event type, and severity.
- [ ] Store timestamps consistently and display them in the user's local time zone.
- [ ] Set retention and storage limits, restrict access, and redact secrets.
- [ ] Handle duplicate events and make gaps caused by outages visible.

**Open decisions:** Choose the event store and decide whether exports are needed.

## Backups

Make it possible to recover configuration and important project data after an
accidental change, device failure, or failed upgrade.

- [ ] Inventory what needs backing up: Home Assistant configuration, MQTT
  configuration and persisted data, future backend data, and optional snapshots.
- [ ] Add manual and scheduled backups with timestamps and a retention policy.
- [ ] Store a copy separately from the running system and protect backups that
  contain credentials or camera images.
- [ ] Use a consistent backup process for live databases and other active data.
- [ ] Display the latest successful backup and report failures.
- [ ] Document restoration steps and verify a restore in an isolated environment.

**Open decisions:** Choose the destination, frequency, retention period, and
whether images and event history are included.

## Cloud Integration

Explore optional cloud services for off-site backups, notifications, or remote
access while keeping core device control and alarm behavior available locally.

- [ ] Select the first concrete use case before choosing a provider.
- [ ] Define which data may leave the local network and make uploads configurable.
- [ ] Keep provider credentials out of source control and browser code.
- [ ] Handle outages with bounded retries and clear sync or delivery status.
- [ ] Define how queued events expire so stale alerts are not delivered as current.
- [ ] Document storage limits, expected costs, and how to disconnect the integration.

**Open decisions:** Prioritize off-site backup, push delivery, or remote access.
Decide whether camera images may be uploaded.

## Suggested Implementation Order

1. Agree on security states, event ownership, and the event format; extend the simulator.
2. Implement door and motion events, entry countdowns, and buzzer behavior.
3. Add event history, push notifications, and camera snapshots.
4. Build the phase 1 console with authentication and session handling.
5. Add backups and verify restoration before enabling broader remote access.
6. Explore cloud integration and the phase 2 shell as separate optional extensions.

## New Ideas

- [ ] **Idea:** … **User benefit:** … **Next step or open question:** …
