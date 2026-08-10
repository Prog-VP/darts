import React from "react";
import { Composition } from "remotion";
import { Post } from "./Post";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Post"
        component={Post}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  );
};
