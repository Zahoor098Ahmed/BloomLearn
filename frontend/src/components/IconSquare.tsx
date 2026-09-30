import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

/** A line icon on a soft rounded square. */
export default function IconSquare({
  icon,
  bg = colors.green,
  color = colors.textDark,
  size = 48,
  round = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  bg?: string;
  color?: string;
  size?: number;
  round?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : size * 0.3,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </View>
  );
}
