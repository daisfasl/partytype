import { Box, Text, useInput } from "ink";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import Menu from "../components/Menu.js";
import PracticeText from "../components/practice/PracticeText.js";
import { recordResult } from "../db/stats.js";
import { GRACE_PERIOD_SECONDS, formatTime, getModeSettingValue } from "../gameMode.js";
import useCountdown from "../hooks/useCountdown.js";
import useTypingEngine from "../hooks/useTypingEngine.js";
import type { UseParty } from "../hooks/useParty.js";
import type { ApiStatus, LeaderboardEntry, Screen } from "../types.js";
import Gradient from "ink-gradient";

interface RaceProps {
  onNavigate: (screen: Screen) => void;
  apiStatus: ApiStatus;
  party: UseParty;
}

// The server broadcasts a RoomPayload with status "countdown" up front, but
// flips its *internal* status to "active" without a follow-up broadcast (it
// only re-broadcasts on the next player action, e.g. a progress payload) -
// see backend/app/game/engine.py's run_game. So the client can't just wait
// on room.status flipping to "active"; it mirrors the server's fixed
// 3-2-1-then-go timing locally instead, using the CountdownPayload events as
// the clock.
const COUNTDOWN_TO_ACTIVE_DELAY_MS = 1000;

function countCompletedWords(typed: string, text: string): number {
  if (typed.length === 0) return 0;
  const typedPortion = text.slice(0, typed.length);
  const words = typedPortion.split(" ");
  const isAtEnd = typed.length === text.length;
  return isAtEnd ? words.length : Math.max(words.length - 1, 0);
}

export default function Race({ onNavigate, apiStatus, party }: RaceProps) {
  const room = party.room;
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [raceActive, setRaceActive] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [raceEnded, setRaceEnded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [graceStartTime, setGraceStartTime] = useState<number | null>(null);
  const finishSentRef = useRef(false);

  const text = raceActive ? (room?.text ?? "") : "";
  const { typed, wpm, accuracy, correctChars } = useTypingEngine(text);

  // "time" mode ends on the server's fixed time_setting clock, started the
  // moment the race goes active for everyone - mirrored locally the same way
  // Practice tracks its own wall-clock timer, but keyed off raceActive
  const durationMs =
    room?.mode === "time" ? room.time_setting * 1000 : undefined;
  const remainingSecondsOrNull = useCountdown({
    durationMs,
    startTime: raceStartTime,
    isDone: raceEnded,
  });
  const remainingSeconds =
    remainingSecondsOrNull ?? (room ? room.time_setting : 0);

  // Once any player finishes, the server gives stragglers a grace period
  // before ending the race for everyone (see backend GRACE_PERIOD_SECONDS).
  // This is a client-side approximation of when that grace period began -
  // not perfectly server-synced, fine for a UX countdown display.
  const anyFinished = room
    ? Object.values(room.players).some((p) => p.finished)
    : false;
  const graceRemainingSeconds = useCountdown({
    durationMs: GRACE_PERIOD_SECONDS * 1000,
    startTime: graceStartTime,
    isDone: raceEnded,
  });

  const goActive = () => {
    setRaceActive(true);
    setRaceStartTime((current) => current ?? Date.now());
  };

  // Drive the countdown overlay + local active transition off lastEvent.
  useEffect(() => {
    if (!party.lastEvent) return;
    if (party.lastEvent.kind === "countdown") {
      // A fresh countdown means a new race is starting. Reset state left
      // over from a previous race - a player who never clicked "Back to
      // Lobby" after the last race ended would otherwise stay stuck on the
      // old results screen forever, since raceEnded/leaderboard never got
      // cleared and that render branch takes priority over the new
      // countdown/race actually starting underneath it.
      setRaceEnded(false);
      setLeaderboard(null);
      setRaceActive(false);
      setRaceStartTime(null);
      setGraceStartTime(null);
      finishSentRef.current = false;

      setCountdownValue(party.lastEvent.value);
      if (party.lastEvent.value === 1) {
        const timer = setTimeout(goActive, COUNTDOWN_TO_ACTIVE_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } else if (party.lastEvent.kind === "end") {
      setLeaderboard(party.lastEvent.leaderboard);
      setRaceEnded(true);
    }
  }, [party.lastEvent?.id]);

  // Safety net: if the room's own status ever reports "active" directly
  // (e.g. because another player's progress payload triggered a broadcast),
  // trust it too.
  useEffect(() => {
    if (room?.status === "active") goActive();
  }, [room?.status]);

  // Mark when the grace period starts, the first time any player finishes.
  useEffect(() => {
    if (anyFinished && graceStartTime === null) {
      setGraceStartTime(Date.now());
    }
  }, [anyFinished, graceStartTime]);

  // Send progress while racing.
  useEffect(() => {
    if (!raceActive || raceEnded || !room) return;
    party.send({
      type: "progress",
      cursor: typed.length,
      completed_words: countCompletedWords(typed, room.text),
      correct_chars: correctChars,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  // Finish only makes sense for words/quote - "time" mode's buffer is sized
  // so players shouldn't reach the end; it only ends via server timeout.
  // Matching length is enough to finish even with mistakes remaining -
  // players should be able to complete the race despite typos, same as solo
  // Practice. This is safe from a "mash garbage to finish fast" incentive
  // because the leaderboard ranks by final wpm, not by who finished first -
  // a low-accuracy sprint to the end just won't rank well.
  useEffect(() => {
    if (!raceActive || raceEnded || !room || finishSentRef.current) return;
    if (room.mode === "time") return;
    if (typed.length > 0 && typed.length === room.text.length) {
      finishSentRef.current = true;
      party.send({ type: "finish" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  // Record the result once the race ends, from whatever this player's own
  // entry in the room's player map shows at that moment.
  useEffect(() => {
    if (!raceEnded || !room || !party.playerId) return;
    const me = room.players[party.playerId];
    if (!me) return;
    const settingValue = getModeSettingValue(
      room.mode,
      room.word_count,
      room.time_setting,
    );
    recordResult(room.mode, settingValue, me.wpm, me.accuracy);
    // Only once per race end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceEnded]);

  useInput((_input, key) => {
    if (raceEnded && key.escape) {
      onNavigate("lobby");
    }
  });

  if (!room) {
    return (
      <Box
        width="100%"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Text dimColor>Connecting...</Text>
      </Box>
    );
  }

  if (raceEnded) {
    const winnerEntry = leaderboard?.[0] ?? null;
    const iWon = winnerEntry !== null && winnerEntry.player_id === party.playerId;
    return (
      <Box flexDirection="column" padding={1} width="100%" height="100%">
        <Header subtitle="Race Results" />
        <Box flexGrow={1} flexDirection="column" alignItems="center" justifyContent="center">
          <Text bold color={iWon ? "#a6e3a1" : undefined}>
            {winnerEntry
              ? `Winner: ${winnerEntry.player_id}${iWon ? " (you!)" : ""}`
              : "Race over"}
          </Text>
          {leaderboard && (
            <Box flexDirection="column" marginTop={1} width={60}>
              <Text dimColor>
                {"Rank".padEnd(6)}
                {"Player".padEnd(14)}
                {"WPM".padEnd(6)}
                {"Acc".padEnd(6)}
                Status
              </Text>
              {leaderboard.map((entry) => {
                const isMe = entry.player_id === party.playerId;
                return (
                  <Text key={entry.player_id} color={isMe ? "#a6e3a1" : undefined}>
                    {`#${entry.rank}`.padEnd(6)}
                    {entry.player_id.padEnd(14)}
                    {String(entry.wpm).padEnd(6)}
                    {`${entry.accuracy}%`.padEnd(6)}
                    {entry.finished ? "finished" : "did not finish"}
                  </Text>
                );
              })}
            </Box>
          )}
          <Menu
            direction="row"
            options={[
              { label: "Back to Lobby", onSelect: () => onNavigate("lobby") },
            ]}
          />
        </Box>
        <Footer
          apiStatus={apiStatus}
          helpText="[enter] back to lobby · [esc] back to lobby"
        />
      </Box>
    );
  }

  if (!raceActive) {
    return (
      <Box
        width="100%"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Box flexDirection="column" alignItems="center">
          <Box flexDirection="column" gap={1} width="100%">
            <Header />
            <Text dimColor>Get Ready</Text>
          </Box>
          <Box marginTop={2}>
            <Text bold>{countdownValue ?? "..."}</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  const iHaveFinished = party.playerId ? (room.players[party.playerId]?.finished ?? false) : false;

  return (
    <Box flexDirection="column" padding={1} width="100%" height="100%">
      <Header subtitle="Race" />
      <Box flexGrow={1} flexDirection="column" justifyContent="center">
        {room.mode === "time" && (
          <Box width={60} alignSelf="center">
            <Gradient name="pastel">
              <Text>Time: {formatTime(remainingSeconds)}</Text>
            </Gradient>
          </Box>
        )}
        <PracticeText
          prompt={room.text}
          typed={typed}
          visibleLines={room.mode === "time" ? 4 : undefined}
        />
        <Box alignSelf="center" justifyContent="center" marginTop={1}>
          <Text>wpm: {wpm}</Text>
          <Text> accuracy: {accuracy}%</Text>
        </Box>
        {graceStartTime !== null && !raceEnded && (
          <Box alignSelf="center" marginTop={1}>
            <Text dimColor>Race ends in {graceRemainingSeconds ?? GRACE_PERIOD_SECONDS}s</Text>
          </Box>
        )}
        {iHaveFinished && (
          <Box alignSelf="center" marginTop={1}>
            <Text dimColor>Waiting for others to finish...</Text>
          </Box>
        )}
        <Box flexDirection="column" marginTop={1} width={60} alignSelf="center">
          <Text dimColor>Opponents:</Text>
          {Object.entries(room.players)
            .filter(([id]) => id !== party.playerId)
            .map(([id, player]) => {
              const barWidth = 20;
              if (player.finished) {
                return (
                  <Text key={id} color="#a6e3a1">
                    {id.padEnd(12)} [{"#".repeat(barWidth)}] {player.wpm} wpm - done
                  </Text>
                );
              }
              const progress = room.text.length > 0 ? player.cursor / room.text.length : 0;
              const filled = Math.min(barWidth, Math.round(progress * barWidth));
              return (
                <Text key={id}>
                  {id.padEnd(12)} [{"#".repeat(filled)}
                  {"-".repeat(barWidth - filled)}] {player.wpm} wpm
                </Text>
              );
            })}
        </Box>
      </Box>
      <Footer
        apiStatus={apiStatus}
        helpText={iHaveFinished ? "Waiting for other racers to finish..." : "Type to race!"}
      />
    </Box>
  );
}
