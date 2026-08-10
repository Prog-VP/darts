import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadUltra } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: ultraFamily } = loadUltra();
const { fontFamily: displayFamily } = loadDisplay();

const BG = "#0d0b09";
const CARD_BG = "#141210";
const CREAM = "#f7e8c4";
const RED = "#ef3e4a";
const RED_DEEP = "#c72a35";
const GREEN = "#2fb06b";
const GREEN_DEEP = "#1f8450";
const GOLD = "#ffc94a";
const ORANGE = "#ff7a2f";
const MUTED = "#b6a98e";

/* ── Timeline (30 fps) ─────────────────────────────── */
const BADGE_IN = 6;
const LOGO_IN = 10;
const DARTS_IN = 20;
const RED_LINE = 40;
const GREEN_LINE = 48;
const CARD_IN = 70;
const DART_START = 108;
const IMPACT = 126;
const SWAP = 148;
const SUBLINE_IN = 178;
const FOOTER_IN = 202;
const OUTRO_START = 288;
const TOTAL = 300;

/* Impact target: centre of the card's value row */
const IMPACT_X = 540;
const IMPACT_Y = 966;
const DART_START_X = 1560;
const DART_START_Y = 320;

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const SHARDS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * 360 + (rand(i * 11) - 0.5) * 30;
  const distance = 220 + rand(i * 17) * 300;
  const spin = (160 + rand(i * 19) * 260) * (rand(i * 29) > 0.5 ? 1 : -1);
  const size = 9 + rand(i * 31) * 16;
  const color = [RED, GOLD, ORANGE, GREEN][i % 4];
  return { angle, distance, spin, size, color };
});

const DART_W = 205;
const DART_H = 52;

const Dart: React.FC = () => (
  <div style={{ position: "relative", width: DART_W, height: DART_H }}>
    {/* pointe */}
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        width: 30,
        height: 10,
        background: "linear-gradient(90deg, #8a8a8a, #f6f2e8)",
        transform: "translateY(-50%)",
        clipPath: "polygon(0 0, 100% 50%, 0 100%)",
      }}
    />
    {/* barrel */}
    <div
      style={{
        position: "absolute",
        right: 25,
        top: "50%",
        width: 85,
        height: 17,
        background: "linear-gradient(180deg, #efe9dc, #77716a 55%, #cdc6ba)",
        transform: "translateY(-50%)",
        borderRadius: 4,
      }}
    />
    {/* tige */}
    <div
      style={{
        position: "absolute",
        right: 107,
        top: "50%",
        width: 36,
        height: 6,
        background: "#2a2724",
        transform: "translateY(-50%)",
        borderRadius: 3,
      }}
    />
    {/* ailette rouge / verte */}
    <div
      style={{
        position: "absolute",
        right: 137,
        top: "50%",
        width: 68,
        height: DART_H,
        background: `linear-gradient(180deg, ${RED} 0%, ${RED} 50%, ${GREEN} 50%, ${GREEN} 100%)`,
        transform: "translateY(-50%)",
        clipPath: "polygon(0 0, 100% 50%, 0 100%)",
      }}
    />
  </div>
);

export const Post: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outroFade = interpolate(frame, [OUTRO_START, TOTAL - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Hook d'ouverture */
  const hookFlash = interpolate(frame, [0, 2, 7], [1, 0.28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringProgress = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ringOpacity = interpolate(frame, [0, 5, 18], [0.9, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Secousses : ouverture + impact fléchette */
  const openShake = interpolate(frame, [0, 4, 15], [18, 8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const impactShake = interpolate(
    frame,
    [IMPACT, IMPACT + 3, IMPACT + 14],
    [0, 16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shake = Math.max(openShake, impactShake);
  const shakeX = shake * Math.sin(frame * 3.7);
  const shakeY = shake * Math.cos(frame * 4.3);

  /* Badge */
  const badge = spring({
    frame: frame - BADGE_IN,
    fps,
    config: { damping: 13, mass: 0.6 },
    durationInFrames: 22,
  });

  /* Logo */
  const lausanne = spring({
    frame: frame - LOGO_IN,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 25,
  });
  const darts = spring({
    frame: frame - DARTS_IN,
    fps,
    config: { damping: 14, mass: 0.7 },
    durationInFrames: 25,
  });

  const redLine = interpolate(frame, [RED_LINE, RED_LINE + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const greenLine = interpolate(frame, [GREEN_LINE, GREEN_LINE + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  /* Carte */
  const cardScale = spring({
    frame: frame - CARD_IN,
    fps,
    config: { damping: 12, mass: 0.6 },
    durationInFrames: 28,
  });
  const cardOpacity = interpolate(frame, [CARD_IN, CARD_IN + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Vol de la fléchette */
  const dartProgress = interpolate(frame, [DART_START, IMPACT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const dartTipX = DART_START_X + (IMPACT_X - DART_START_X) * dartProgress;
  const dartTipY = DART_START_Y + (IMPACT_Y - DART_START_Y) * dartProgress;
  const dartAngle =
    (Math.atan2(IMPACT_Y - DART_START_Y, IMPACT_X - DART_START_X) * 180) /
    Math.PI;
  const dartWobble =
    frame >= IMPACT
      ? Math.sin((frame - IMPACT) * 1.1) *
        Math.max(0, 7 - (frame - IMPACT) * 0.55)
      : 0;
  const dartVisible = frame >= DART_START && frame < SWAP + 10;
  const dartFade = interpolate(frame, [SWAP, SWAP + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Barre de rature sur la date */
  const strike = interpolate(frame, [IMPACT, IMPACT + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  /* Étincelles à l'impact */
  const sparkProgress = interpolate(frame, [IMPACT, IMPACT + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const sparkOpacity = interpolate(
    frame,
    [IMPACT, IMPACT + 6, IMPACT + 20],
    [1, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  /* Bascule ancienne date → cet automne */
  const oldDateOut = interpolate(frame, [SWAP, SWAP + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oldDateDrop = interpolate(frame, [SWAP, SWAP + 14], [0, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const newDate = spring({
    frame: frame - (SWAP + 10),
    fps,
    config: { damping: 11, mass: 0.6 },
    durationInFrames: 26,
  });

  /* Textes de bas de visuel */
  const subline = interpolate(frame, [SUBLINE_IN, SUBLINE_IN + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sublineY = interpolate(frame, [SUBLINE_IN, SUBLINE_IN + 20], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const footer = interpolate(frame, [FOOTER_IN, FOOTER_IN + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const float =
    frame > CARD_IN + 28
      ? Math.sin(((frame - CARD_IN - 28) / fps) * (Math.PI / 2)) * 4
      : 0;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* Fond : mêmes halos que le site */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at 8% 6%, rgba(239, 62, 74, 0.22), transparent 34%),
            radial-gradient(circle at 92% 12%, rgba(255, 122, 47, 0.18), transparent 30%),
            radial-gradient(circle at 12% 88%, rgba(47, 176, 107, 0.16), transparent 34%),
            radial-gradient(circle at 88% 86%, rgba(255, 201, 74, 0.14), transparent 32%)
          `,
        }}
      />

      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          opacity: outroFade,
        }}
      >
        {/* Onde de choc d'ouverture */}
        {ringOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 640,
              width: 80 + ringProgress * 1750,
              height: 80 + ringProgress * 1750,
              borderRadius: "50%",
              border: `${6 + (1 - ringProgress) * 8}px solid rgba(247,232,196,${ringOpacity})`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: 208,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: badge,
            transform: `translateY(${(1 - badge) * -40}px)`,
          }}
        >
          <div
            style={{
              padding: "16px 34px",
              border: `3px solid ${RED}`,
              borderRadius: 999,
              background: RED,
              color: CREAM,
              fontFamily: ultraFamily,
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              transform: "rotate(-1.6deg)",
              boxShadow: `6px 6px 0 ${CREAM}`,
            }}
          >
            Des nouvelles du chantier
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: ultraFamily,
            fontSize: 168,
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            textTransform: "uppercase",
            color: CREAM,
          }}
        >
          <div
            style={{
              opacity: lausanne,
              transform: `translateY(${(1 - lausanne) * 46}px)`,
            }}
          >
            Lausanne
          </div>
          <div
            style={{
              opacity: darts,
              transform: `translateY(${(1 - darts) * 46}px)`,
              position: "relative",
              paddingBottom: 44,
            }}
          >
            Darts
            <div
              style={{
                position: "absolute",
                bottom: 26,
                left: 0,
                height: 12,
                width: `${redLine * 100}%`,
                background: RED,
                borderRadius: 6,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: 0,
                height: 12,
                width: `${greenLine * 100}%`,
                background: GREEN,
                borderRadius: 6,
              }}
            />
          </div>
        </div>

        {/* Carte date */}
        <div
          style={{
            position: "absolute",
            top: 812,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 780,
              opacity: cardOpacity,
              transform: `scale(${cardScale}) translateY(${float}px)`,
              padding: "40px 48px 46px",
              border: `4px solid ${CREAM}`,
              borderRadius: 28,
              background: CARD_BG,
              boxShadow: `12px 12px 0 ${GREEN_DEEP}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: displayFamily,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 22,
              }}
            >
              Ouverture
            </div>

            {/* Zone valeur : ancienne date puis « cet automne » */}
            <div style={{ position: "relative", height: 132 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: oldDateOut,
                  transform: `translateY(${oldDateDrop}px) rotate(${
                    oldDateDrop * 0.09
                  }deg)`,
                }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <span
                    style={{
                      fontFamily: ultraFamily,
                      fontSize: 88,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      color: CREAM,
                      opacity: 1 - strike * 0.45,
                    }}
                  >
                    1er août
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      top: "52%",
                      left: -18,
                      width: `${strike * 116}%`,
                      height: 14,
                      background: RED,
                      borderRadius: 7,
                      transform: "translateY(-50%) rotate(-3deg)",
                      boxShadow: `0 0 0 4px ${CARD_BG}`,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: newDate,
                  transform: `scale(${0.7 + newDate * 0.3})`,
                }}
              >
                <div
                  style={{
                    padding: "22px 44px",
                    borderRadius: 20,
                    background: GOLD,
                    color: BG,
                    fontFamily: ultraFamily,
                    fontSize: 66,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    transform: "rotate(-1.5deg)",
                    boxShadow: `10px 10px 0 ${RED_DEEP}`,
                  }}
                >
                  Cet automne
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            position: "absolute",
            top: 1122,
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "0 110px",
            opacity: subline,
            transform: `translateY(${sublineY}px)`,
            fontFamily: displayFamily,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: 1.35,
            color: MUTED,
          }}
        >
          Pas encore de date d’ouverture.
          <br />
          Profitez de l’été — on se voit à la rentrée.
        </div>

        {/* Pied */}
        <div
          style={{
            position: "absolute",
            bottom: 74,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: footer,
            fontFamily: ultraFamily,
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7a6f5c",
          }}
        >
          lausanne-darts.ch
        </div>

        {/* Fléchette */}
        {dartVisible && (
          <div
            style={{
              position: "absolute",
              left: dartTipX - DART_W,
              top: dartTipY - DART_H / 2 + oldDateDrop,
              width: DART_W,
              height: DART_H,
              transform: `rotate(${
                dartAngle + dartWobble + oldDateDrop * 0.09
              }deg)`,
              transformOrigin: "100% 50%",
              opacity: dartFade,
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.55))",
            }}
          >
            <Dart />
          </div>
        )}

        {/* Éclats à l'impact */}
        {frame >= IMPACT &&
          sparkOpacity > 0 &&
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
                }deg) translateX(${s.distance * sparkProgress}px) rotate(${
                  s.spin * sparkProgress
                }deg)`,
                background: s.color,
                opacity: sparkOpacity,
                clipPath: "polygon(0 30%, 100% 0, 70% 100%)",
              }}
            />
          ))}
      </AbsoluteFill>

      {hookFlash > 0 && (
        <AbsoluteFill style={{ background: CREAM, opacity: hookFlash }} />
      )}
    </AbsoluteFill>
  );
};
