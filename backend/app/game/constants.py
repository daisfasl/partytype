# Internal, non-user-facing safety caps for game logic.

# Backstop timeout (seconds) for "words"/"quote" mode races. Those modes end
# when someone finishes typing, but need a cap so an abandoned race (nobody
# finishes) can't hold a room open forever. Not a host-configurable setting —
# see UpdateSettingsPayload.time_setting for the user-facing "time" mode
# duration.
MAX_RACE_DURATION = 300

# How long to wait after the first player finishes before ending the race for
# everyone, so players who are still racing get a chance to finish too.
GRACE_PERIOD_SECONDS = 15

# How often (seconds) the AFK-lobby watchdog wakes up to check whether a
# "waiting" room has gone idle.
AFK_LOBBY_CHECK_INTERVAL_SECONDS = 60

# How long (seconds) a "waiting" room can sit with no inbound activity before
# the watchdog closes it out, to avoid leaking abandoned rooms forever.
AFK_LOBBY_TIMEOUT_SECONDS = 600
