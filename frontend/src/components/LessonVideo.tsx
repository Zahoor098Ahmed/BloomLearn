import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { colors } from "../theme";

/**
 * A lesson's clip in the picture box. It starts by itself as soon as it has
 * loaded and loops calmly; pausing is up to the child or parent. Browsers may
 * refuse to start a clip with sound on their own, so then it starts muted with
 * a big "Tap for sound" button. The clip's own voice reads the sentence.
 */
export default function LessonVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
  });
  const [needsTap, setNeedsTap] = useState(false);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    player.muted = false;
    player.play();
    // a browser that blocks sound leaves the clip paused: play it muted instead
    setTimeout(() => {
      if (!player.playing) {
        player.muted = true;
        player.play();
        setNeedsTap(true);
      }
    }, 600);
  }

  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") start();
  });
  // already loaded (a clip shown before): start straight away
  useEffect(() => {
    if (player.status === "readyToPlay") start();
  }, [player]);

  function soundOn() {
    player.muted = false;
    player.play();
    setNeedsTap(false);
  }

  return (
    <View style={styles.box}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
      {needsTap && (
        <Pressable onPress={soundOn} style={styles.soundBtn} accessibilityRole="button" accessibilityLabel="Tap for sound">
          <Ionicons name="volume-high" size={22} color="white" />
          <Text style={styles.soundText}>Tap for sound</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: "hidden",
  },
  video: { width: "100%", height: "100%" },
  soundBtn: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.forest,
  },
  soundText: { color: "white", fontSize: 15, fontWeight: "800" },
});
