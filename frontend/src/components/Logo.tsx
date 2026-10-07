import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Path, Circle, Ellipse, G } from "react-native-svg";

interface LogoProps {
  size?: number;
}

const PETAL = "#f6c453";
const PETAL_DEEP = "#f0a93b";

/**
 * The BloomLearn mark — the same drawing as the app icon (assets/icon.png):
 * a speech bubble (the child speaks) with a flower blooming out of an open
 * book (learning grows), on the app's forest green.
 */
export default function Logo({ size = 88 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5a9a82" />
          <Stop offset="0.55" stopColor="#2d5f4f" />
          <Stop offset="1" stopColor="#1f4437" />
        </LinearGradient>
        <RadialGradient id="glow" cx="0.35" cy="0.3" r="0.7">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect width="100" height="100" rx="22" fill="url(#badge)" />
      <Rect width="100" height="100" rx="22" fill="url(#glow)" />

      {/* twinkles */}
      <Path d="M86 9.8 Q86 14 90.2 14 Q86 14 86 18.2 Q86 14 81.8 14 Q86 14 86 9.8 Z" fill="#fff7e6" opacity={0.95} />
      <Path d="M13 82.8 Q13 86 16.2 86 Q13 86 13 89.2 Q13 86 9.8 86 Q13 86 13 82.8 Z" fill="#fff7e6" opacity={0.75} />

      {/* speech bubble */}
      <Path
        d="M30 18 H70 A14 14 0 0 1 84 32 V58 A14 14 0 0 1 70 72 H46 L31 84 L34 72 H30 A14 14 0 0 1 16 58 V32 A14 14 0 0 1 30 18 Z"
        fill="#fff7e6"
      />

      {/* stem and leaves */}
      <Path d="M50 43 C50 50 49 57 50 64" stroke="#3f7a63" strokeWidth={2.8} fill="none" strokeLinecap="round" />
      <Path d="M49.6 59 C43.5 59 38.8 56.2 36.8 51.8 C42.2 51 47.4 53.6 49.6 59 Z" fill="#5c9c7f" />
      <Path d="M50.3 54.5 C56 54.2 60.6 50.8 62.6 46.4 C57.2 46 52 49 50.3 54.5 Z" fill="#5c9c7f" />

      {/* flower */}
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <G key={a} rotation={a} origin="50, 35.5">
          <Ellipse cx={50} cy={28.1} rx={4.9} ry={7.2} fill={i % 2 ? PETAL_DEEP : PETAL} />
        </G>
      ))}
      <Circle cx={50} cy={35.5} r={4.8} fill="#e2733a" />
      <Circle cx={48.5} cy={34} r={1.4} fill="#fff3d6" opacity={0.9} />

      {/* open book the flower grows from */}
      <Path d="M33.5 63.5 Q41.5 59.8 50 64 Q58.5 59.8 66.5 63.5 V68.6 Q58.5 65 50 69.2 Q41.5 65 33.5 68.6 Z" fill="#2d5f4f" />
      <Path
        d="M35.6 64.4 Q42.4 61.6 49 64.9 V67.5 Q42.4 64.4 35.6 66.9 Z M51 64.9 Q57.6 61.6 64.4 64.4 V66.9 Q57.6 64.4 51 67.5 Z"
        fill="#e3ede8"
      />
    </Svg>
  );
}
