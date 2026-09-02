# Internal, non-user-facing safety caps for game logic.

# Backstop timeout (seconds) for "words"/"quote" mode races. Those modes end
# when someone finishes typing, but need a cap so an abandoned race (nobody
# finishes) can't hold a room open forever. Not a host-configurable setting —
# see UpdateSettingsPayload.time_setting for the user-facing "time" mode
# duration.
MAX_RACE_DURATION = 300
