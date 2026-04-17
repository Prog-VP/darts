import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";

const { fontFamily: bebasFamily } = loadBebas();
const { fontFamily: outfitFamily } = loadOutfit();

const CREAM = "#F0E6D2";
const RED = "#E63946";
const GREEN = "#2D8B46";
const AMBER = "#F4A024";
const MUTED = "#9a9a9a";
const BG = "#0a0a0a";

const IMPACT_X = 540;
const IMPACT_Y = 730;
const DART_START_X = 1400;
const DART_START_Y = -320;

const DART_START_FRAME = 40;
const IMPACT_FRAME = 56;
const OUTRO_START = 200;
const TOTAL = 240;

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const STREAKS = Array.from({ length: 18 }, (_, i) => {
  const baseAngle = (i / 18) * 360;
  const angle = baseAngle + (rand(i * 7) - 0.5) * 22;
  const length = 550 + rand(i * 13) * 420;
  const width = 2 + Math.floor(rand(i * 23) * 3);
  return { angle, length, width };
});

const SHARDS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * 360 + (rand(i * 11) - 0.5) * 25;
  const distance = 420 + rand(i * 17) * 420;
  const spin =
    (140 + rand(i * 19) * 220) * (rand(i * 29) > 0.5 ? 1 : -1);
  const size = 10 + rand(i * 31) * 22;
  return { angle, distance, spin, size };
});

const Dart: React.FC = () => {
  return (
    <div style={{ position: "relative", width: 125, height: 32 }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          width: 18,
          height: 6,
          background: "linear-gradient(90deg, #8a8a8a, #f2f2f2)",
          transform: "translateY(-50%)",
          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 15,
          top: "50%",
          width: 52,
          height: 10,
          background: "linear-gradient(180deg, #e8e8e8, #7a7a7a 55%, #c0c0c0)",
          transform: "translateY(-50%)",
          borderRadius: 2,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 65,
          top: "50%",
          width: 22,
          height: 3,
          background: "#2a2a2a",
          transform: "translateY(-50%)",
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 85,
          top: "50%",
          width: 40,
          height: 32,
          background:
            "linear-gradient(180deg, #E63946 0%, #E63946 50%, #2D8B46 50%, #2D8B46 100%)",
          transform: "translateY(-50%)",
          clipPath: "polygon(0 0, 100% 50%, 0 100%)",
        }}
      />
    </div>
  );
};

export const Post: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse =
    0.55 + Math.sin((frame / fps) * (Math.PI / 2)) * 0.2;

  const outroFade = interpolate(frame, [OUTRO_START, TOTAL - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Opening hook
  const hookFlash = interpolate(frame, [0, 2, 6], [1, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hookCore = interpolate(frame, [0, 4, 12], [1, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shockwaveProgress = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shockwaveOpacity = interpolate(frame, [0, 4, 16], [0.95, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const streakProgress = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const streakOpacity = interpolate(frame, [0, 6, 20, 38], [1, 0.9, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shardProgress = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shardOpacity = interpolate(frame, [0, 4, 18, 30], [1, 0.95, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shake: two events (opening + dart impact)
  const initialShake = interpolate(frame, [0, 3, 14], [22, 10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dartShake = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 3, IMPACT_FRAME + 12],
    [0, 14, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shakeStrength = Math.max(initialShake, dartShake);
  const shakeX = shakeStrength * Math.sin(frame * 3.7);
  const shakeY = shakeStrength * Math.cos(frame * 4.3);

  // Tag
  const tagY = interpolate(frame, [6, 26], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tagOpacity = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo
  const lausanne = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 25,
  });
  const darts = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 25,
  });

  // Underlines
  const redLine = interpolate(frame, [34, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const greenLine = interpolate(frame, [44, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Tagline
  const tagline = interpolate(frame, [68, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Card
  const cardScale = spring({
    frame: frame - 92,
    fps,
    config: { damping: 12, mass: 0.6 },
    durationInFrames: 30,
  });
  const cardOpacity = interpolate(frame, [92, 118], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Footer
  const footerOpacity = interpolate(frame, [128, 148], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Dart flight
  const dartProgress = interpolate(
    frame,
    [DART_START_FRAME, IMPACT_FRAME],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    }
  );
  const dartVisible = frame >= DART_START_FRAME;
  const dartTipX = DART_START_X + (IMPACT_X - DART_START_X) * dartProgress;
  const dartTipY = DART_START_Y + (IMPACT_Y - DART_START_Y) * dartProgress;
  const dartAngle =
    (Math.atan2(IMPACT_Y - DART_START_Y, IMPACT_X - DART_START_X) * 180) /
    Math.PI;

  // Dart impact sparks
  const sparkProgress = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 16],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  const sparkOpacity = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 5, IMPACT_FRAME + 16],
    [1, 0.95, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const floatY =
    frame > 118
      ? Math.sin(((frame - 118) / fps) * (Math.PI / 2)) * 4
      : 0;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1500,
          height: 1500,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(230, 57, 70, ${
            glowPulse * 0.18
          }) 0%, rgba(45, 139, 70, ${
            glowPulse * 0.1
          }) 35%, transparent 65%)`,
          filter: "blur(90px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          opacity: outroFade,
        }}
      >
        {hookCore > 0 && (
          <div
            style={{
              position: "absolute",
              left: IMPACT_X,
              top: IMPACT_Y,
              width: 650,
              height: 650,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,214,102,0.75) 25%, rgba(244,160,36,0.4) 50%, transparent 72%)",
              opacity: hookCore,
              filter: "blur(32px)",
              pointerEvents: "none",
            }}
          />
        )}

        {shockwaveOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: IMPACT_X,
              top: IMPACT_Y,
              width: 60 + shockwaveProgress * 1700,
              height: 60 + shockwaveProgress * 1700,
              borderRadius: "50%",
              border: `${
                4 + (1 - shockwaveProgress) * 6
              }px solid rgba(255, 255, 255, ${shockwaveOpacity})`,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 80px rgba(255,255,255,${shockwaveOpacity * 0.5})`,
              pointerEvents: "none",
            }}
          />
        )}

        {streakOpacity > 0 &&
          STREAKS.map((s, i) => (
            <div
              key={`streak-${i}`}
              style={{
                position: "absolute",
                left: IMPACT_X,
                top: IMPACT_Y,
                width: streakProgress * s.length,
                height: s.width,
                transformOrigin: "0 50%",
                transform: `translateY(-${s.width / 2}px) rotate(${
                  s.angle
                }deg)`,
                background: `linear-gradient(90deg, rgba(255,255,255,${streakOpacity}) 0%, rgba(255,255,255,${
                  streakOpacity * 0.35
                }) 55%, transparent 100%)`,
                pointerEvents: "none",
              }}
            />
          ))}

        {shardOpacity > 0 &&
          SHARDS.map((s, i) => (
            <div
              key={`shard-${i}`}
              style={{
                position: "absolute",
                left: IMPACT_X,
                top: IMPACT_Y,
                width: s.size * 2,
                height: s.size,
                transformOrigin: "50% 50%",
                transform: `translate(-50%, -50%) rotate(${
                  s.angle
                }deg) translateX(${s.distance * shardProgress}px) rotate(${
                  s.spin * shardProgress
                }deg)`,
                background: `rgba(240, 230, 210, ${shardOpacity})`,
                clipPath: "polygon(0 30%, 100% 0, 70% 100%)",
                pointerEvents: "none",
                boxShadow: `0 0 8px rgba(255,255,255,${shardOpacity * 0.5})`,
              }}
            />
          ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: outfitFamily,
            color: CREAM,
          }}
        >
          <div
            style={{
              opacity: tagOpacity,
              transform: `translateY(${tagY}px)`,
              padding: "14px 34px",
              border: `1px solid rgba(244, 160, 36, 0.3)`,
              borderRadius: 999,
              background: "rgba(244, 160, 36, 0.1)",
              color: AMBER,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: 60,
            }}
          >
            Save the date
          </div>

          <div
            style={{
              fontFamily: bebasFamily,
              fontSize: 220,
              lineHeight: 0.82,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                opacity: lausanne,
                transform: `translateY(${(1 - lausanne) * 40}px)`,
                color: CREAM,
              }}
            >
              Lausanne
            </div>
            <div
              style={{
                opacity: darts,
                transform: `translateY(${(1 - darts) * 40}px)`,
                color: CREAM,
                position: "relative",
                paddingBottom: "0.22em",
              }}
            >
              Darts
              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  left: 0,
                  height: 6,
                  width: `${redLine * 100}%`,
                  background: RED,
                  borderRadius: 3,
                  boxShadow: `0 0 24px ${RED}`,
                }}
              >
                {redLine >= 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: RED,
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 16px ${RED}`,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 0,
                  height: 6,
                  width: `${greenLine * 100}%`,
                  background: GREEN,
                  borderRadius: 3,
                  boxShadow: `0 0 24px ${GREEN}`,
                }}
              >
                {greenLine >= 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: GREEN,
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 16px ${GREEN}`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              opacity: tagline,
              marginTop: 36,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.55em",
              textTransform: "uppercase",
              color: MUTED,
              paddingLeft: "0.55em",
            }}
          >
            Pile au centre
          </div>

          <div
            style={{
              opacity: cardOpacity,
              transform: `scale(${cardScale}) translateY(${floatY}px)`,
              marginTop: 90,
              padding: "38px 70px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 28,
              background: "rgba(17,17,17,0.7)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 14,
              }}
            >
              Opening
            </div>
            <div
              style={{
                fontFamily: bebasFamily,
                fontSize: 84,
                letterSpacing: "0.02em",
                color: CREAM,
                lineHeight: 1,
              }}
            >
              1
              <sup style={{ fontSize: "0.45em", verticalAlign: "super" }}>
                er
              </sup>{" "}
              août 2026
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: footerOpacity,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#6a6a6a",
            fontFamily: outfitFamily,
          }}
        >
          lausanne-darts.ch
        </div>

        {dartVisible && (
          <div
            style={{
              position: "absolute",
              left: dartTipX - 125,
              top: dartTipY - 16,
              width: 125,
              height: 32,
              transform: `rotate(${dartAngle}deg)`,
              transformOrigin: "100% 50%",
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
            }}
          >
            <Dart />
          </div>
        )}

        {sparkProgress > 0 && sparkOpacity > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: IMPACT_X,
                top: IMPACT_Y,
                width: 0,
                height: 0,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 360 + (i % 2) * 6;
                const length = 30 + sparkProgress * 90;
                const distance = sparkProgress * 40;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: length,
                      height: 2,
                      left: 0,
                      top: -1,
                      transform: `rotate(${angle}deg) translateX(${distance}px)`,
                      transformOrigin: "0 50%",
                      background: `linear-gradient(90deg, ${AMBER}, rgba(244,160,36,0))`,
                      opacity: sparkOpacity,
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                left: IMPACT_X,
                top: IMPACT_Y,
                width: 0,
                height: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: `${-60 - sparkProgress * 40}px`,
                  top: `${-60 - sparkProgress * 40}px`,
                  width: 120 + sparkProgress * 80,
                  height: 120 + sparkProgress * 80,
                  borderRadius: "50%",
                  border: `2px solid ${AMBER}`,
                  opacity: sparkOpacity * 0.6,
                }}
              />
            </div>
          </>
        )}
      </div>

      {hookFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: hookFlash,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
